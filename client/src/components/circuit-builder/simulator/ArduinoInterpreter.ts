/**
 * ArduinoInterpreter.ts - Professional-grade Arduino code interpreter
 * Uses proper compiler design patterns: lexer, parser, AST, and interpreter
 */

// Token types for lexical analysis
enum TokenType {
  // Literals
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  IDENTIFIER = 'IDENTIFIER',
  
  // Keywords
  VOID = 'VOID',
  INT = 'INT',
  FLOAT = 'FLOAT',
  BOOL = 'BOOL',
  IF = 'IF',
  ELSE = 'ELSE',
  FOR = 'FOR',
  WHILE = 'WHILE',
  SWITCH = 'SWITCH',
  CASE = 'CASE',
  BREAK = 'BREAK',
  RETURN = 'RETURN',
  SETUP = 'SETUP',
  LOOP = 'LOOP',
  
  // Operators
  PLUS = 'PLUS',
  MINUS = 'MINUS',
  MULTIPLY = 'MULTIPLY',
  DIVIDE = 'DIVIDE',
  MODULO = 'MODULO',
  ASSIGN = 'ASSIGN',
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  LESS_THAN = 'LESS_THAN',
  GREATER_THAN = 'GREATER_THAN',
  LESS_EQUAL = 'LESS_EQUAL',
  GREATER_EQUAL = 'GREATER_EQUAL',
  AND = 'AND',
  OR = 'OR',
  NOT = 'NOT',
  INCREMENT = 'INCREMENT',
  DECREMENT = 'DECREMENT',
  SHIFT_LEFT = 'SHIFT_LEFT',
  SHIFT_RIGHT = 'SHIFT_RIGHT',
  BITWISE_AND = 'BITWISE_AND',
  BITWISE_OR = 'BITWISE_OR',
  
  // Delimiters
  SEMICOLON = 'SEMICOLON',
  COMMA = 'COMMA',
  DOT = 'DOT',
  LPAREN = 'LPAREN',
  RPAREN = 'RPAREN',
  LBRACE = 'LBRACE',
  RBRACE = 'RBRACE',
  LBRACKET = 'LBRACKET',
  RBRACKET = 'RBRACKET',
  COLON = 'COLON',
  
  EOF = 'EOF'
}

interface Token {
  type: TokenType;
  value: any;
  line: number;
  column: number;
}

// Abstract Syntax Tree node types
interface ASTNode {
  type: string;
  line?: number;
}

interface ProgramNode extends ASTNode {
  type: 'Program';
  functions: FunctionNode[];
  globals: VariableDeclarationNode[];
}

interface FunctionNode extends ASTNode {
  type: 'Function';
  name: string;
  returnType: string;
  params: ParameterNode[];
  body: BlockNode;
}

interface ParameterNode extends ASTNode {
  type: 'Parameter';
  dataType: string;
  name: string;
}

interface BlockNode extends ASTNode {
  type: 'Block';
  statements: StatementNode[];
}

interface StatementNode extends ASTNode {
  type: 'Statement';
}

interface VariableDeclarationNode extends StatementNode {
  type: 'VariableDeclaration';
  dataType: string;
  name: string;
  initialValue?: ExpressionNode;
}

interface ExpressionStatementNode extends StatementNode {
  type: 'ExpressionStatement';
  expression: ExpressionNode;
}

interface IfStatementNode extends StatementNode {
  type: 'IfStatement';
  condition: ExpressionNode;
  thenBranch: StatementNode;
  elseBranch?: StatementNode;
}

interface ForStatementNode extends StatementNode {
  type: 'ForStatement';
  init: StatementNode | null;
  condition: ExpressionNode | null;
  update: ExpressionNode | null;
  body: StatementNode;
}

interface WhileStatementNode extends StatementNode {
  type: 'WhileStatement';
  condition: ExpressionNode;
  body: StatementNode;
}

interface SwitchStatementNode extends StatementNode {
  type: 'SwitchStatement';
  expression: ExpressionNode;
  cases: CaseNode[];
}

interface CaseNode extends ASTNode {
  type: 'Case';
  value: ExpressionNode | null; // null for default case
  statements: StatementNode[];
}

interface ExpressionNode extends ASTNode {
  type: 'Expression';
}

interface BinaryExpressionNode extends ExpressionNode {
  type: 'BinaryExpression';
  operator: string;
  left: ExpressionNode;
  right: ExpressionNode;
}

interface UnaryExpressionNode extends ExpressionNode {
  type: 'UnaryExpression';
  operator: string;
  argument: ExpressionNode;
}

interface CallExpressionNode extends ExpressionNode {
  type: 'CallExpression';
  callee: ExpressionNode;
  arguments: ExpressionNode[];
}

interface MemberExpressionNode extends ExpressionNode {
  type: 'MemberExpression';
  object: ExpressionNode;
  property: ExpressionNode;
}

interface IdentifierNode extends ExpressionNode {
  type: 'Identifier';
  name: string;
}

interface LiteralNode extends ExpressionNode {
  type: 'Literal';
  value: any;
  raw: string;
}

// Lexer: Converts source code to tokens
class ArduinoLexer {
  private source: string;
  private current: number = 0;
  private line: number = 1;
  private column: number = 1;
  private tokens: Token[] = [];

  constructor(source: string) {
    this.source = source;
  }

  tokenize(): Token[] {
    while (!this.isAtEnd()) {
      this.scanToken();
    }
    
    this.tokens.push({
      type: TokenType.EOF,
      value: null,
      line: this.line,
      column: this.column
    });
    
    return this.tokens;
  }

  private scanToken(): void {
    const start = this.current;
    const c = this.advance();

    switch (c) {
      case ' ':
      case '\r':
      case '\t':
        break;
      case '\n':
        this.line++;
        this.column = 1;
        break;
      case '/':
        if (this.peek() === '/') {
          // Comment
          while (this.peek() !== '\n' && !this.isAtEnd()) this.advance();
        } else if (this.peek() === '*') {
          // Block comment
          this.advance();
          while (!(this.peek() === '*' && this.peekNext() === '/') && !this.isAtEnd()) {
            if (this.peek() === '\n') this.line++;
            this.advance();
          }
          this.advance(); // *
          this.advance(); // /
        } else {
          this.addToken(TokenType.DIVIDE);
        }
        break;
      case '(': this.addToken(TokenType.LPAREN); break;
      case ')': this.addToken(TokenType.RPAREN); break;
      case '{': this.addToken(TokenType.LBRACE); break;
      case '}': this.addToken(TokenType.RBRACE); break;
      case '[': this.addToken(TokenType.LBRACKET); break;
      case ']': this.addToken(TokenType.RBRACKET); break;
      case ',': this.addToken(TokenType.COMMA); break;
      case '.': this.addToken(TokenType.DOT); break;
      case ';': this.addToken(TokenType.SEMICOLON); break;
      case ':': this.addToken(TokenType.COLON); break;
      case '+':
        if (this.peek() === '+') {
          this.advance();
          this.addToken(TokenType.INCREMENT);
        } else {
          this.addToken(TokenType.PLUS);
        }
        break;
      case '-':
        if (this.peek() === '-') {
          this.advance();
          this.addToken(TokenType.DECREMENT);
        } else {
          this.addToken(TokenType.MINUS);
        }
        break;
      case '*': this.addToken(TokenType.MULTIPLY); break;
      case '%': this.addToken(TokenType.MODULO); break;
      case '!':
        this.addToken(this.match('=') ? TokenType.NOT_EQUALS : TokenType.NOT);
        break;
      case '=':
        this.addToken(this.match('=') ? TokenType.EQUALS : TokenType.ASSIGN);
        break;
      case '<':
        if (this.match('<')) {
          this.addToken(TokenType.SHIFT_LEFT);
        } else {
          this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS_THAN);
        }
        break;
      case '>':
        if (this.match('>')) {
          this.addToken(TokenType.SHIFT_RIGHT);
        } else {
          this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER_THAN);
        }
        break;
      case '&':
        this.addToken(this.match('&') ? TokenType.AND : TokenType.BITWISE_AND);
        break;
      case '|':
        this.addToken(this.match('|') ? TokenType.OR : TokenType.BITWISE_OR);
        break;
      case '"':
        this.string();
        break;
      default:
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          this.identifier();
        }
        break;
    }
  }

  private string(): void {
    const startColumn = this.column;
    let value = '';
    
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === '\n') this.line++;
      if (this.peek() === '\\') {
        this.advance();
        const escaped = this.advance();
        switch (escaped) {
          case 'n': value += '\n'; break;
          case 't': value += '\t'; break;
          case 'r': value += '\r'; break;
          case '\\': value += '\\'; break;
          case '"': value += '"'; break;
          default: value += escaped;
        }
      } else {
        value += this.advance();
      }
    }

    if (this.isAtEnd()) {
      throw new Error(`Unterminated string at line ${this.line}`);
    }

    this.advance(); // Closing "
    
    this.tokens.push({
      type: TokenType.STRING,
      value: value,
      line: this.line,
      column: startColumn
    });
  }

  private number(): void {
    const startColumn = this.column;
    let value = this.source[this.current - 1];
    
    while (this.isDigit(this.peek())) {
      value += this.advance();
    }

    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      value += this.advance();
      while (this.isDigit(this.peek())) {
        value += this.advance();
      }
    }

    this.tokens.push({
      type: TokenType.NUMBER,
      value: parseFloat(value),
      line: this.line,
      column: startColumn
    });
  }

  private identifier(): void {
    const startColumn = this.column;
    let value = this.source[this.current - 1];
    
    while (this.isAlphaNumeric(this.peek())) {
      value += this.advance();
    }

    const keywords: { [key: string]: TokenType } = {
      'void': TokenType.VOID,
      'int': TokenType.INT,
      'float': TokenType.FLOAT,
      'bool': TokenType.BOOL,
      'boolean': TokenType.BOOL,
      'if': TokenType.IF,
      'else': TokenType.ELSE,
      'for': TokenType.FOR,
      'while': TokenType.WHILE,
      'switch': TokenType.SWITCH,
      'case': TokenType.CASE,
      'break': TokenType.BREAK,
      'return': TokenType.RETURN,
      'setup': TokenType.SETUP,
      'loop': TokenType.LOOP
    };

    const type = keywords[value] || TokenType.IDENTIFIER;
    
    this.tokens.push({
      type: type,
      value: value,
      line: this.line,
      column: startColumn
    });
  }

  private advance(): string {
    this.column++;
    return this.source[this.current++];
  }

  private match(expected: string): boolean {
    if (this.isAtEnd()) return false;
    if (this.source[this.current] !== expected) return false;
    this.current++;
    this.column++;
    return true;
  }

  private peek(): string {
    if (this.isAtEnd()) return '\0';
    return this.source[this.current];
  }

  private peekNext(): string {
    if (this.current + 1 >= this.source.length) return '\0';
    return this.source[this.current + 1];
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  private isDigit(c: string): boolean {
    return c >= '0' && c <= '9';
  }

  private isAlpha(c: string): boolean {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_';
  }

  private isAlphaNumeric(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c);
  }

  private addToken(type: TokenType, value: any = null): void {
    this.tokens.push({
      type: type,
      value: value,
      line: this.line,
      column: this.column
    });
  }
}

// Parser: Converts tokens to Abstract Syntax Tree
class ArduinoParser {
  private tokens: Token[];
  private current: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): ProgramNode {
    const globals: VariableDeclarationNode[] = [];
    const functions: FunctionNode[] = [];

    while (!this.isAtEnd()) {
      if (this.check(TokenType.VOID) || this.check(TokenType.INT) || this.check(TokenType.FLOAT)) {
        const next = this.peek(1);
        if (next && next.type === TokenType.IDENTIFIER) {
          const afterNext = this.peek(2);
          if (afterNext && afterNext.type === TokenType.LPAREN) {
            functions.push(this.functionDeclaration());
          } else {
            globals.push(this.variableDeclaration());
          }
        }
      } else {
        this.advance(); // Skip unknown tokens
      }
    }

    return {
      type: 'Program',
      functions: functions,
      globals: globals
    };
  }

  private functionDeclaration(): FunctionNode {
    const returnType = this.advance().value;
    const name = this.consume(TokenType.IDENTIFIER, 'Expected function name').value;
    
    this.consume(TokenType.LPAREN, 'Expected ( after function name');
    
    const params: ParameterNode[] = [];
    if (!this.check(TokenType.RPAREN)) {
      do {
        const paramType = this.advance().value;
        const paramName = this.consume(TokenType.IDENTIFIER, 'Expected parameter name').value;
        params.push({
          type: 'Parameter',
          dataType: paramType,
          name: paramName
        });
      } while (this.match(TokenType.COMMA));
    }
    
    this.consume(TokenType.RPAREN, 'Expected ) after parameters');
    const body = this.blockStatement();
    
    return {
      type: 'Function',
      name: name,
      returnType: returnType,
      params: params,
      body: body
    };
  }

  private blockStatement(): BlockNode {
    this.consume(TokenType.LBRACE, 'Expected {');
    
    const statements: StatementNode[] = [];
    
    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      statements.push(this.statement());
    }
    
    this.consume(TokenType.RBRACE, 'Expected }');
    
    return {
      type: 'Block',
      statements: statements
    };
  }

  private statement(): StatementNode {
    if (this.match(TokenType.IF)) return this.ifStatement();
    if (this.match(TokenType.FOR)) return this.forStatement();
    if (this.match(TokenType.WHILE)) return this.whileStatement();
    if (this.match(TokenType.SWITCH)) return this.switchStatement();
    if (this.match(TokenType.LBRACE)) return this.blockStatement();
    
    if (this.check(TokenType.INT) || this.check(TokenType.FLOAT) || this.check(TokenType.BOOL)) {
      return this.variableDeclaration();
    }
    
    return this.expressionStatement();
  }

  private ifStatement(): IfStatementNode {
    this.consume(TokenType.LPAREN, 'Expected ( after if');
    const condition = this.expression();
    this.consume(TokenType.RPAREN, 'Expected ) after condition');
    
    const thenBranch = this.statement();
    let elseBranch: StatementNode | undefined;
    
    if (this.match(TokenType.ELSE)) {
      elseBranch = this.statement();
    }
    
    return {
      type: 'IfStatement',
      condition: condition,
      thenBranch: thenBranch,
      elseBranch: elseBranch
    };
  }

  private forStatement(): ForStatementNode {
    this.consume(TokenType.LPAREN, 'Expected ( after for');
    
    let init: StatementNode | null = null;
    if (!this.check(TokenType.SEMICOLON)) {
      if (this.check(TokenType.INT) || this.check(TokenType.FLOAT)) {
        init = this.variableDeclaration();
      } else {
        init = this.expressionStatement();
      }
    } else {
      this.consume(TokenType.SEMICOLON, 'Expected ;');
    }
    
    let condition: ExpressionNode | null = null;
    if (!this.check(TokenType.SEMICOLON)) {
      condition = this.expression();
    }
    this.consume(TokenType.SEMICOLON, 'Expected ;');
    
    let update: ExpressionNode | null = null;
    if (!this.check(TokenType.RPAREN)) {
      update = this.expression();
    }
    
    this.consume(TokenType.RPAREN, 'Expected ) after for clauses');
    
    const body = this.statement();
    
    return {
      type: 'ForStatement',
      init: init,
      condition: condition,
      update: update,
      body: body
    };
  }

  private whileStatement(): WhileStatementNode {
    this.consume(TokenType.LPAREN, 'Expected ( after while');
    const condition = this.expression();
    this.consume(TokenType.RPAREN, 'Expected ) after condition');
    
    const body = this.statement();
    
    return {
      type: 'WhileStatement',
      condition: condition,
      body: body
    };
  }

  private switchStatement(): SwitchStatementNode {
    this.consume(TokenType.LPAREN, 'Expected ( after switch');
    const expression = this.expression();
    this.consume(TokenType.RPAREN, 'Expected ) after expression');
    
    this.consume(TokenType.LBRACE, 'Expected { for switch body');
    
    const cases: CaseNode[] = [];
    
    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      if (this.match(TokenType.CASE)) {
        const value = this.expression();
        this.consume(TokenType.COLON, 'Expected : after case value');
        
        const statements: StatementNode[] = [];
        while (!this.check(TokenType.CASE) && !this.check(TokenType.RBRACE) && !this.isAtEnd()) {
          if (this.match(TokenType.BREAK)) {
            this.consume(TokenType.SEMICOLON, 'Expected ; after break');
            break;
          }
          statements.push(this.statement());
        }
        
        cases.push({
          type: 'Case',
          value: value,
          statements: statements
        });
      } else {
        this.advance(); // Skip unknown tokens
      }
    }
    
    this.consume(TokenType.RBRACE, 'Expected } after switch body');
    
    return {
      type: 'SwitchStatement',
      expression: expression,
      cases: cases
    };
  }

  private variableDeclaration(): VariableDeclarationNode {
    const dataType = this.advance().value;
    const name = this.consume(TokenType.IDENTIFIER, 'Expected variable name').value;
    
    let initialValue: ExpressionNode | undefined;
    if (this.match(TokenType.ASSIGN)) {
      initialValue = this.expression();
    }
    
    this.consume(TokenType.SEMICOLON, 'Expected ; after variable declaration');
    
    return {
      type: 'VariableDeclaration',
      dataType: dataType,
      name: name,
      initialValue: initialValue
    };
  }

  private expressionStatement(): ExpressionStatementNode {
    const expr = this.expression();
    this.consume(TokenType.SEMICOLON, 'Expected ; after expression');
    
    return {
      type: 'ExpressionStatement',
      expression: expr
    };
  }

  private expression(): ExpressionNode {
    return this.assignment();
  }

  private assignment(): ExpressionNode {
    const expr = this.logicalOr();
    
    if (this.match(TokenType.ASSIGN)) {
      const value = this.assignment();
      return {
        type: 'BinaryExpression',
        operator: '=',
        left: expr,
        right: value
      };
    }
    
    return expr;
  }

  private logicalOr(): ExpressionNode {
    let expr = this.logicalAnd();
    
    while (this.match(TokenType.OR)) {
      const operator = this.previous().value;
      const right = this.logicalAnd();
      expr = {
        type: 'BinaryExpression',
        operator: operator,
        left: expr,
        right: right
      };
    }
    
    return expr;
  }

  private logicalAnd(): ExpressionNode {
    let expr = this.equality();
    
    while (this.match(TokenType.AND)) {
      const operator = this.previous().value;
      const right = this.equality();
      expr = {
        type: 'BinaryExpression',
        operator: operator,
        left: expr,
        right: right
      };
    }
    
    return expr;
  }

  private equality(): ExpressionNode {
    let expr = this.comparison();
    
    while (this.match(TokenType.EQUALS, TokenType.NOT_EQUALS)) {
      const operator = this.previous().value || this.previous().type;
      const right = this.comparison();
      expr = {
        type: 'BinaryExpression',
        operator: operator,
        left: expr,
        right: right
      };
    }
    
    return expr;
  }

  private comparison(): ExpressionNode {
    let expr = this.shift();
    
    while (this.match(TokenType.GREATER_THAN, TokenType.GREATER_EQUAL, TokenType.LESS_THAN, TokenType.LESS_EQUAL)) {
      const operator = this.previous().type;
      const right = this.shift();
      expr = {
        type: 'BinaryExpression',
        operator: operator,
        left: expr,
        right: right
      };
    }
    
    return expr;
  }

  private shift(): ExpressionNode {
    let expr = this.addition();
    
    while (this.match(TokenType.SHIFT_LEFT, TokenType.SHIFT_RIGHT)) {
      const operator = this.previous().type === TokenType.SHIFT_LEFT ? '<<' : '>>';
      const right = this.addition();
      expr = {
        type: 'BinaryExpression',
        operator: operator,
        left: expr,
        right: right
      };
    }
    
    return expr;
  }

  private addition(): ExpressionNode {
    let expr = this.multiplication();
    
    while (this.match(TokenType.PLUS, TokenType.MINUS)) {
      const operator = this.previous().type === TokenType.PLUS ? '+' : '-';
      const right = this.multiplication();
      expr = {
        type: 'BinaryExpression',
        operator: operator,
        left: expr,
        right: right
      };
    }
    
    return expr;
  }

  private multiplication(): ExpressionNode {
    let expr = this.unary();
    
    while (this.match(TokenType.MULTIPLY, TokenType.DIVIDE, TokenType.MODULO)) {
      const operator = this.previous().type === TokenType.MULTIPLY ? '*' : 
                      this.previous().type === TokenType.DIVIDE ? '/' : '%';
      const right = this.unary();
      expr = {
        type: 'BinaryExpression',
        operator: operator,
        left: expr,
        right: right
      };
    }
    
    return expr;
  }

  private unary(): ExpressionNode {
    if (this.match(TokenType.NOT, TokenType.MINUS, TokenType.INCREMENT, TokenType.DECREMENT)) {
      const operator = this.previous().type;
      const right = this.unary();
      return {
        type: 'UnaryExpression',
        operator: operator,
        argument: right
      };
    }
    
    return this.postfix();
  }

  private postfix(): ExpressionNode {
    let expr = this.call();
    
    if (this.match(TokenType.INCREMENT, TokenType.DECREMENT)) {
      return {
        type: 'UnaryExpression',
        operator: this.previous().type,
        argument: expr
      };
    }
    
    return expr;
  }

  private call(): ExpressionNode {
    let expr = this.primary();
    
    while (true) {
      if (this.match(TokenType.LPAREN)) {
        expr = this.finishCall(expr);
      } else if (this.match(TokenType.DOT)) {
        const name = this.consume(TokenType.IDENTIFIER, 'Expected property name after .').value;
        expr = {
          type: 'MemberExpression',
          object: expr,
          property: {
            type: 'Identifier',
            name: name
          }
        };
      } else {
        break;
      }
    }
    
    return expr;
  }

  private finishCall(callee: ExpressionNode): CallExpressionNode {
    const args: ExpressionNode[] = [];
    
    if (!this.check(TokenType.RPAREN)) {
      do {
        args.push(this.expression());
      } while (this.match(TokenType.COMMA));
    }
    
    this.consume(TokenType.RPAREN, 'Expected ) after arguments');
    
    return {
      type: 'CallExpression',
      callee: callee,
      arguments: args
    };
  }

  private primary(): ExpressionNode {
    if (this.match(TokenType.NUMBER)) {
      return {
        type: 'Literal',
        value: this.previous().value,
        raw: String(this.previous().value)
      };
    }
    
    if (this.match(TokenType.STRING)) {
      return {
        type: 'Literal',
        value: this.previous().value,
        raw: `"${this.previous().value}"`
      };
    }
    
    if (this.match(TokenType.IDENTIFIER)) {
      return {
        type: 'Identifier',
        name: this.previous().value
      };
    }
    
    if (this.match(TokenType.LPAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RPAREN, 'Expected ) after expression');
      return expr;
    }
    
    throw new Error(`Unexpected token: ${this.peek().type} at line ${this.peek().line}`);
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(offset: number = 0): Token {
    if (this.current + offset >= this.tokens.length) {
      return this.tokens[this.tokens.length - 1];
    }
    return this.tokens[this.current + offset];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    throw new Error(`${message} at line ${this.peek().line}`);
  }
}

// Interpreter: Executes the Abstract Syntax Tree
export class ArduinoInterpreter {
  private ast: ProgramNode | null = null;
  private globals: Map<string, any> = new Map();
  private currentScope: Map<string, any> = new Map();
  private setupFunction: FunctionNode | null = null;
  private loopFunction: FunctionNode | null = null;
  private output: any[] = [];
  private breakFlag: boolean = false;
  private continueFlag: boolean = false;

  constructor() {
    this.initializeBuiltins();
  }

  private initializeBuiltins(): void {
    // Arduino constants
    this.globals.set('HIGH', 1);
    this.globals.set('LOW', 0);
    this.globals.set('INPUT', 0);
    this.globals.set('OUTPUT', 1);
    this.globals.set('INPUT_PULLUP', 2);
    this.globals.set('LED_BUILTIN', 13);
    
    // Arduino functions
    this.globals.set('delay', (ms: number) => {
      this.output.push({ type: 'delay', value: ms });
    });
    
    this.globals.set('Serial', {
      begin: (baud: number) => {
        this.output.push({ type: 'serial.begin', value: baud });
      },
      print: (value: any) => {
        this.output.push({ type: 'serial.print', value: value });
      },
      println: (value: any) => {
        this.output.push({ type: 'serial.println', value: value });
      }
    });
  }

  compile(code: string): void {
    console.log('ArduinoInterpreter: Starting compilation');
    
    // Lexical analysis
    const lexer = new ArduinoLexer(code);
    const tokens = lexer.tokenize();
    console.log(`ArduinoInterpreter: Lexer produced ${tokens.length} tokens`);
    
    // Parsing
    const parser = new ArduinoParser(tokens);
    this.ast = parser.parse();
    console.log(`ArduinoInterpreter: Parser found ${this.ast.functions.length} functions`);
    
    // Find setup and loop functions
    for (const func of this.ast.functions) {
      if (func.name === 'setup') {
        this.setupFunction = func;
        console.log('ArduinoInterpreter: Found setup() function');
      } else if (func.name === 'loop') {
        this.loopFunction = func;
        console.log('ArduinoInterpreter: Found loop() function');
      }
    }
    
    // Process global variables
    for (const global of this.ast.globals) {
      const value = global.initialValue ? this.evaluateExpression(global.initialValue) : 0;
      this.globals.set(global.name, value);
    }
  }

  executeSetup(): any[] {
    this.output = [];
    
    if (this.setupFunction) {
      console.log('ArduinoInterpreter: Executing setup()');
      this.executeBlock(this.setupFunction.body);
    }
    
    return this.output;
  }

  executeLoop(): any[] {
    this.output = [];
    
    if (this.loopFunction) {
      console.log('ArduinoInterpreter: Executing loop()');
      this.executeBlock(this.loopFunction.body);
    }
    
    return this.output;
  }

  private executeBlock(block: BlockNode): void {
    const previousScope = this.currentScope;
    this.currentScope = new Map(this.currentScope);
    
    for (const statement of block.statements) {
      if (this.breakFlag || this.continueFlag) break;
      this.executeStatement(statement);
    }
    
    this.currentScope = previousScope;
  }

  private executeStatement(statement: StatementNode): void {
    switch (statement.type) {
      case 'Block':
        this.executeBlock(statement as BlockNode);
        break;
        
      case 'VariableDeclaration':
        const varDecl = statement as VariableDeclarationNode;
        const value = varDecl.initialValue ? this.evaluateExpression(varDecl.initialValue) : 0;
        this.currentScope.set(varDecl.name, value);
        break;
        
      case 'ExpressionStatement':
        const exprStmt = statement as ExpressionStatementNode;
        this.evaluateExpression(exprStmt.expression);
        break;
        
      case 'IfStatement':
        const ifStmt = statement as IfStatementNode;
        const condition = this.evaluateExpression(ifStmt.condition);
        if (condition) {
          this.executeStatement(ifStmt.thenBranch);
        } else if (ifStmt.elseBranch) {
          this.executeStatement(ifStmt.elseBranch);
        }
        break;
        
      case 'ForStatement':
        this.executeForStatement(statement as ForStatementNode);
        break;
        
      case 'WhileStatement':
        this.executeWhileStatement(statement as WhileStatementNode);
        break;
        
      case 'SwitchStatement':
        this.executeSwitchStatement(statement as SwitchStatementNode);
        break;
    }
  }

  private executeForStatement(stmt: ForStatementNode): void {
    // Initialize
    if (stmt.init) {
      this.executeStatement(stmt.init);
    }
    
    // Loop
    while (true) {
      // Check condition
      if (stmt.condition) {
        const condition = this.evaluateExpression(stmt.condition);
        if (!condition) break;
      }
      
      // Execute body
      this.executeStatement(stmt.body);
      
      if (this.breakFlag) {
        this.breakFlag = false;
        break;
      }
      
      if (this.continueFlag) {
        this.continueFlag = false;
      }
      
      // Update
      if (stmt.update) {
        this.evaluateExpression(stmt.update);
      }
    }
  }

  private executeWhileStatement(stmt: WhileStatementNode): void {
    while (true) {
      const condition = this.evaluateExpression(stmt.condition);
      if (!condition) break;
      
      this.executeStatement(stmt.body);
      
      if (this.breakFlag) {
        this.breakFlag = false;
        break;
      }
      
      if (this.continueFlag) {
        this.continueFlag = false;
      }
    }
  }

  private executeSwitchStatement(stmt: SwitchStatementNode): void {
    const value = this.evaluateExpression(stmt.expression);
    
    let matched = false;
    for (const caseNode of stmt.cases) {
      if (!matched && caseNode.value) {
        const caseValue = this.evaluateExpression(caseNode.value);
        if (value === caseValue) {
          matched = true;
        }
      }
      
      if (matched) {
        for (const statement of caseNode.statements) {
          this.executeStatement(statement);
          if (this.breakFlag) {
            this.breakFlag = false;
            return;
          }
        }
      }
    }
  }

  private evaluateExpression(expr: ExpressionNode): any {
    switch (expr.type) {
      case 'Literal':
        return (expr as LiteralNode).value;
        
      case 'Identifier':
        const name = (expr as IdentifierNode).name;
        if (this.currentScope.has(name)) {
          return this.currentScope.get(name);
        }
        if (this.globals.has(name)) {
          return this.globals.get(name);
        }
        return 0;
        
      case 'BinaryExpression':
        return this.evaluateBinaryExpression(expr as BinaryExpressionNode);
        
      case 'UnaryExpression':
        return this.evaluateUnaryExpression(expr as UnaryExpressionNode);
        
      case 'CallExpression':
        return this.evaluateCallExpression(expr as CallExpressionNode);
        
      case 'MemberExpression':
        return this.evaluateMemberExpression(expr as MemberExpressionNode);
        
      default:
        return 0;
    }
  }

  private evaluateBinaryExpression(expr: BinaryExpressionNode): any {
    const left = this.evaluateExpression(expr.left);
    const right = this.evaluateExpression(expr.right);
    
    switch (expr.operator) {
      case '+': return left + right;
      case '-': return left - right;
      case '*': return left * right;
      case '/': return left / right;
      case '%': return left % right;
      case '<<': return left << right;
      case '>>': return left >> right;
      case '<': return left < right;
      case '>': return left > right;
      case '<=': return left <= right;
      case '>=': return left >= right;
      case '==': return left === right;
      case '!=': return left !== right;
      case '&&': return left && right;
      case '||': return left || right;
      case '&': return left & right;
      case '|': return left | right;
      case '=':
        if (expr.left.type === 'Identifier') {
          const name = (expr.left as IdentifierNode).name;
          this.currentScope.set(name, right);
          return right;
        }
        break;
    }
    
    return 0;
  }

  private evaluateUnaryExpression(expr: UnaryExpressionNode): any {
    const arg = this.evaluateExpression(expr.argument);
    
    switch (expr.operator) {
      case TokenType.MINUS: return -arg;
      case TokenType.NOT: return !arg;
      case TokenType.INCREMENT:
        if (expr.argument.type === 'Identifier') {
          const name = (expr.argument as IdentifierNode).name;
          const value = this.currentScope.get(name) || this.globals.get(name) || 0;
          this.currentScope.set(name, value + 1);
          return value + 1;
        }
        break;
      case TokenType.DECREMENT:
        if (expr.argument.type === 'Identifier') {
          const name = (expr.argument as IdentifierNode).name;
          const value = this.currentScope.get(name) || this.globals.get(name) || 0;
          this.currentScope.set(name, value - 1);
          return value - 1;
        }
        break;
    }
    
    return 0;
  }

  private evaluateCallExpression(expr: CallExpressionNode): any {
    const callee = this.evaluateExpression(expr.callee);
    const args = expr.arguments.map(arg => this.evaluateExpression(arg));
    
    if (typeof callee === 'function') {
      return callee(...args);
    }
    
    // Handle special Arduino functions
    if (expr.callee.type === 'MemberExpression') {
      const member = expr.callee as MemberExpressionNode;
      const obj = this.evaluateExpression(member.object);
      const prop = (member.property as IdentifierNode).name;
      
      // Record the function call for simulation
      this.output.push({
        type: 'function',
        object: obj,
        method: prop,
        arguments: args
      });
      
      if (obj && typeof obj[prop] === 'function') {
        return obj[prop](...args);
      }
    }
    
    return 0;
  }

  private evaluateMemberExpression(expr: MemberExpressionNode): any {
    const obj = this.evaluateExpression(expr.object);
    const prop = (expr.property as IdentifierNode).name;
    
    if (obj && typeof obj === 'object') {
      return obj[prop];
    }
    
    return 0;
  }
}

export default ArduinoInterpreter;