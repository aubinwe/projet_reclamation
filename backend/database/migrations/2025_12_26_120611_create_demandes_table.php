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
        Schema::create('demandes', function (Blueprint $table) {
            $table->id();
            $table->string('nom_prenom');
            $table->string('filiere_niveau');
            $table->foreignId('matiere_id')->constrained()->onDelete('cascade');
            $table->foreignId('enseignant_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->string('objet');
            $table->text('objectif');
            $table->text('motif');
            $table->string('justification')->nullable(); // file path
            $table->enum('statut', ['SOUMISE', 'RECUE_SCOLARITE', 'REJETEE_SCOLARITE', 'ENVOYEE_DA', 'IMPUTEE_ENSEIGNANT', 'VALIDEE', 'NON_VALIDEE']);
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('demandes');
    }
};
