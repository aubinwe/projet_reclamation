<?php

namespace Database\Seeders;

use App\Models\Filiere;
use App\Models\Matiere;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Roles
        $roles = [
            ['name' => 'student'],
            ['name' => 'registrar'],
            ['name' => 'teacher'],
            ['name' => 'admin'],
        ];

        foreach ($roles as $role) {
            Role::create($role);
        }

        // Filieres
        $filiereNames = [
            'Informatique',
            'Comptabilité Contrôle Audit',
            'Assistanat de Direction',
            'Marketing et Innovation Digital',
            'Assurance Banque Finance',
        ];

        $niveaux = [
            'Licence 1',
            'Licence 2',
            'Licence 3',
        ];

        foreach ($filiereNames as $name) {
            foreach ($niveaux as $niveau) {
                Filiere::create(['name' => $name, 'niveau' => $niveau]);
            }
        }

        // Users
        $users = [
            [
                'name' => 'Admin DA',
                'email' => 'da@ibam.com',
                'password' => Hash::make('password'),
                'role_id' => 4, // admin
                'filiere_id' => null,
            ],
            [
                'name' => 'Agent Scolarite',
                'email' => 'scolarite@ibam.com',
                'password' => Hash::make('password'),
                'role_id' => 2, // registrar
                'filiere_id' => null,
            ],
            [
                'name' => 'Enseignant 1',
                'email' => 'enseignant1@ibam.com',
                'password' => Hash::make('password'),
                'role_id' => 3, // teacher
                'filiere_id' => null,
            ],
            [
                'name' => 'Etudiant 1',
                'email' => 'etudiant1@ibam.com',
                'password' => Hash::make('password'),
                'role_id' => 1, // student
                'filiere_id' => 1, // Informatique L3
            ],
        ];

        foreach ($users as $user) {
            User::create($user);
        }

        // Matieres
        $matieres = [
            ['name' => 'Mathématiques', 'filiere_id' => 1, 'enseignant_id' => 3],
            ['name' => 'Physique', 'filiere_id' => 1, 'enseignant_id' => 3],
            ['name' => 'Chimie', 'filiere_id' => 1, 'enseignant_id' => 3],
            ['name' => 'Programmation', 'filiere_id' => 1, 'enseignant_id' => 3],
            ['name' => 'Base de données', 'filiere_id' => 1, 'enseignant_id' => 3],
            ['name' => 'Réseaux', 'filiere_id' => 1, 'enseignant_id' => 3],
            ['name' => 'Analyse', 'filiere_id' => 2, 'enseignant_id' => 3],
            ['name' => 'Algèbre', 'filiere_id' => 2, 'enseignant_id' => 3],
            ['name' => 'Statistiques', 'filiere_id' => 2, 'enseignant_id' => 3],
        ];

        foreach ($matieres as $matiere) {
            Matiere::create($matiere);
        }

        // Demande de test 1 (Scolarité)
        \App\Models\Demande::create([
            'user_id' => 4,
            'matiere_id' => 1,
            'objet' => 'Erreur note examen final',
            'objectif' => 'Correction de la note de 11 à 14',
            'motif' => 'Je pense avoir répondu juste à la question 3 de la section algorithmique.',
            'statut' => 'SOUMISE',
            'nom_prenom' => 'Etudiant 1',
            'filiere_niveau' => 'Informatique L3',
            'enseignant_id' => null,
            'enseignant_nom' => 'Dr. Traoré',
            'note_actuelle' => 11,
            'note_demandee' => 14,
            'justification' => null,
        ]);

        // Demande de test 2 (Déjà transmise au DA)
        \App\Models\Demande::create([
            'user_id' => 4,
            'matiere_id' => 2,
            'objet' => 'Omission de bonus de projet',
            'objectif' => 'Ajout du point de bonus promis',
            'motif' => 'Mon projet a été validé avec bonus par l\'enseignant mais n\'apparaît pas sur le relevé.',
            'statut' => 'ENVOYEE_DA',
            'nom_prenom' => 'Etudiant 1',
            'filiere_niveau' => 'Informatique L3',
            'enseignant_id' => null,
            'enseignant_nom' => 'Pr. Ouédraogo',
            'note_actuelle' => 9,
            'note_demandee' => 10,
            'justification' => null,
            'commentaire_scolarite' => 'Justificatif vérifié. À transmettre pour imputation.',
        ]);

        // Seed Notifications for Student
        \App\Models\Notification::create([
            'user_id' => 4,
            'message' => 'Votre demande a été reçue par la scolarité.',
            'type' => 'status_update',
            'demande_id' => 1,
            'created_at' => now(),
        ]);

        \App\Models\Notification::create([
            'user_id' => 4,
            'message' => 'Votre note a été corrigée par l\'enseignant.',
            'type' => 'status_update',
            'demande_id' => 2,
            'created_at' => now()->subHours(2),
        ]);
    }
}
