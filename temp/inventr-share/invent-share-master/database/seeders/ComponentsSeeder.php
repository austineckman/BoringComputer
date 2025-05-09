<?php

namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ComponentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run():void
    {
        DB::table('components')->insert([
            [
                "name"=>"led",
                "description"=>"A device emitting light from current flowing through it",
                "attrs"=>json_encode('{"rotate":0,"color":"red","brightness":"100","flip":"","value":0,"top":10,"left":10}'),
                "kit_id"=>1
            ],
            [
                "name"=>"rgb-led",
                "description"=>"A light emitting diode that can produce multiple colors",
                "attrs"=>json_encode('{"ledRed":0,"ledGreen":0.05,"ledBlue":0,"top":10,"left":10,"rotate":0}'),
                "kit_id"=>1
            ],
            [
                "name"=>"hero-board",
                "description"=>"A microcontroller development board",
                "attrs"=>json_encode('{"rotate":0,"ledPower":true,"top":10,"left":10}'),
                "kit_id"=>1
            ],
            [
                "name"=>"resistor",
                "description"=>"A device used to resist the flow of electric current",
                "attrs"=> json_encode('{"rotate":0,"value":"321","top":10,"left":10}'),
                "kit_id"=>1
            ],
            [
                "name"=>"buzzer",
                "description"=>"A device making a buzzing noise when electricity is applied",
                "attrs"=> json_encode('{"rotate":0,"hasSignal":false,"top":10,"left":10}'),
                "kit_id"=>1
            ],
            [
                "name"=>"photoresistor",
                "description"=>"A resistor whose resistance varies with light intensity",
                "attrs"=>json_encode('{"rotate":0,"value":"100","top":10,"left":10}'),
                "kit_id"=>1
            ],
            [
                "name"=>"rotary-encoder",
                "description"=>"A position sensor that provides an output signal indicating the amount of rotation",
                "attrs"=>json_encode('{"rotate":0,"angle":0,"stepSize":10,"top":10,"left":10}'),
                "kit_id"=>1
            ],
            [
                "name"=>"dip-switch-3",
                "description"=>"A three-switch manual electrical input device",
                "attrs"=>json_encode('{"rotate":0,"value":[0,0,0],"top":10,"left":10}'),
                "kit_id"=>1
            ],
            [
                "name"=>"segmented-display",
                "description"=>"A seven-segment display is a type of electronic display device for displaying decimal numeric digit characters.",
                "attrs"=>json_encode('{"rotate":0,"value":[0,0,0],"top":10,"left":10}'),
                "kit_id"=>1
            ],
            [
                "name"=>"oled-display",
                "description"=>"A light emitting diode display using organic compounds",
                "attrs"=>json_encode('{"rotate":0,"top":10,"left":10,"brightness":1.0}'),
                "kit_id"=>1
            ],
            [
                "name"=>"custom-keypad",
                "description"=>"A custom input device with several buttons",
                "attrs"=>json_encode('{"rotate":0,"top":10,"left":10}'),
                "kit_id"=>1
            ],
            [
                "name"=>"breadboard-mini",
                "description"=>"A smaller version of a solderless breadboard, for prototyping electronic circuits",
                "attrs"=>json_encode('{"rotate":0,"top":10,"left":10}'),
                "kit_id"=>1
            ]
        ]);
    }
}
