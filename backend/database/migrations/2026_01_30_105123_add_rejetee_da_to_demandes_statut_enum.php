<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE demandes MODIFY COLUMN statut ENUM('SOUMISE', 'RECUE_SCOLARITE', 'REJETEE_SCOLARITE', 'ENVOYEE_DA', 'IMPUTEE_ENSEIGNANT', 'VALIDEE', 'NON_VALIDEE', 'REJETEE_DA') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE demandes MODIFY COLUMN statut ENUM('SOUMISE', 'RECUE_SCOLARITE', 'REJETEE_SCOLARITE', 'ENVOYEE_DA', 'IMPUTEE_ENSEIGNANT', 'VALIDEE', 'NON_VALIDEE') NOT NULL");
    }
};
