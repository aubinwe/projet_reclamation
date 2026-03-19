<?php

namespace Database\Seeders;

use App\Models\Matiere;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MatiereSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $matieres = [
            ['nom' => 'Mathématiques', 'code' => 'MATH', 'filiere_id' => 1],
            ['nom' => 'Physique', 'code' => 'PHYS', 'filiere_id' => 1],
            ['nom' => 'Chimie', 'code' => 'CHIM', 'filiere_id' => 1],
            ['nom' => 'Programmation', 'code' => 'PROG', 'filiere_id' => 2],
            ['nom' => 'Base de données', 'code' => 'BDD', 'filiere_id' => 2],
            ['nom' => 'Réseaux', 'code' => 'RES', 'filiere_id' => 2],
            ['nom' => 'Comptabilité', 'code' => 'COMPT', 'filiere_id' => 3],
            ['nom' => 'Finance', 'code' => 'FIN', 'filiere_id' => 3],
            ['nom' => 'Marketing', 'code' => 'MARK', 'filiere_id' => 3],
        ];

        foreach ($matieres as $matiere) {
            Matiere::create($matiere);
        }
    }
}
