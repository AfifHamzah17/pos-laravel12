<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class SalesSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->call('sales:generate-dummy');
    }
}
