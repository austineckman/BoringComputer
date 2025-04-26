import { and, eq, gt, isNull, or } from "drizzle-orm";
import { db } from "../db";
import { BaseRepository } from "./base-repository";
import { 
  quests, 
  questComponents, 
  kitComponents, 
  componentKits,
  userQuests,
  InsertQuest,
  Quest,
  InsertQuestComponent,
  QuestComponent
} from "@shared/schema";

/**
 * Quest repository for quest-related database operations
 */
export class QuestRepository extends BaseRepository<Quest, InsertQuest> {
  constructor() {
    super(quests, {
      componentRequirements: true,
      kit: true,
    });
  }

  /**
   * Get all quests with their component requirements and related kit information
   */
  async getQuestsWithComponents() {
    return db.query.quests.findMany({
      with: {
        componentRequirements: {
          with: {
            component: {
              with: {
                kit: true,
              },
            },
          },
        },
        kit: true,
      },
    });
  }

  /**
   * Get quests by kit ID with component requirements
   */
  async getQuestsByKitId(kitId: string) {
    return db.query.quests.findMany({
      where: eq(quests.kitId, kitId),
      with: {
        componentRequirements: {
          with: {
            component: {
              with: {
                kit: true,
              },
            },
          },
        },
        kit: true,
      },
    });
  }

  /**
   * Get quests by component requirements that reference components in a specific kit
   */
  async getQuestsByComponentKitId(kitId: string) {
    // First, get all components for this kit
    const kitComponentsList = await db.query.kitComponents.findMany({
      where: eq(kitComponents.kitId, kitId),
    });

    if (kitComponentsList.length === 0) {
      return [];
    }

    const componentIds = kitComponentsList.map(component => component.id);

    // Now find quests that reference these components
    return db.query.quests.findMany({
      with: {
        componentRequirements: {
          where: (fields, { inArray }) => inArray(fields.componentId, componentIds),
          with: {
            component: {
              with: {
                kit: true,
              },
            },
          },
        },
        kit: true,
      },
      // Only include quests that have matching component requirements
      where: (fields, { exists }) =>
        exists(
          db.select().from(questComponents).where(
            and(
              eq(questComponents.questId, fields.id),
              or(...componentIds.map(id => eq(questComponents.componentId, id)))
            )
          )
        ),
    });
  }

  /**
   * Get quests with their availability status for a specific user
   */
  async getQuestsForUser(userId: number) {
    const userQuestStatuses = await db.query.userQuests.findMany({
      where: eq(userQuests.userId, userId),
    });

    const allQuests = await this.getQuestsWithComponents();

    // Map user quest statuses to quests
    return allQuests.map(quest => {
      const userStatus = userQuestStatuses.find(uq => uq.questId === quest.id);
      return {
        ...quest,
        status: userStatus?.status || 'locked',
      };
    });
  }

  /**
   * Get available quests for a user
   */
  async getAvailableQuestsForUser(userId: number) {
    // Get user's current quests
    const userQuestStatuses = await db.query.userQuests.findMany({
      where: eq(userQuests.userId, userId),
    });

    // Get quests that are either marked as available or not yet in the user's quests
    const availableQuests = await db.query.quests.findMany({
      where: (fields, { notExists, and, eq }) =>
        or(
          // Quests marked as "available" in user_quests
          exists(
            db.select()
              .from(userQuests)
              .where(
                and(
                  eq(userQuests.userId, userId),
                  eq(userQuests.questId, fields.id),
                  eq(userQuests.status, 'available')
                )
              )
          ),
          // Quests not yet in user_quests (with some other conditions like ordered by adventure line)
          and(
            notExists(
              db.select()
                .from(userQuests)
                .where(
                  and(
                    eq(userQuests.userId, userId),
                    eq(userQuests.questId, fields.id)
                  )
                )
            ),
            // Is first quest in adventure line or previous quest is completed
            or(
              eq(fields.orderInLine, 1),
              exists(
                db.select()
                  .from(quests)
                  .innerJoin(
                    userQuests,
                    and(
                      eq(userQuests.questId, quests.id),
                      eq(userQuests.userId, userId),
                      eq(userQuests.status, 'completed')
                    )
                  )
                  .where(
                    and(
                      eq(quests.adventureLine, fields.adventureLine),
                      eq(quests.orderInLine, fields.orderInLine - 1)
                    )
                  )
              )
            )
          )
        ),
      with: {
        componentRequirements: {
          with: {
            component: {
              with: {
                kit: true,
              },
            },
          },
        },
        kit: true,
      },
    });

    return availableQuests;
  }

  /**
   * Add a component requirement to a quest
   */
  async addComponentRequirement(questComponent: InsertQuestComponent): Promise<QuestComponent> {
    const [created] = await db.insert(questComponents).values(questComponent).returning();
    return created;
  }

  /**
   * Get a quest with its components by ID
   */
  async getQuestWithComponents(questId: number) {
    return db.query.quests.findFirst({
      where: eq(quests.id, questId),
      with: {
        componentRequirements: {
          with: {
            component: {
              with: {
                kit: true,
              },
            },
          },
        },
        kit: true,
      },
    });
  }

  /**
   * Get quests for the admin dashboard
   */
  async getQuestsForAdmin() {
    return db.query.quests.findMany({
      with: {
        componentRequirements: {
          with: {
            component: true,
          },
        },
        kit: true,
      },
      orderBy: (fields, { asc }) => [
        asc(fields.adventureLine),
        asc(fields.orderInLine)
      ],
    });
  }
}