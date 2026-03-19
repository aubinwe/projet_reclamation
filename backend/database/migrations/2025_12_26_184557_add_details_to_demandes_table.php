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
        // Ajout des colonnes pour le traitement des réclamations
        Schema::table('demandes', function (Blueprint $table) {
            $table->float('note_actuelle')->nullable();
            $table->float('note_demandee')->nullable();
            $table->float('note_finale')->nullable();
            $table->text('commentaire_scolarite')->nullable();
            $table->text('commentaire_enseignant')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('demandes', function (Blueprint $table) {
            $table->dropColumn(['note_actuelle', 'note_demandee', 'note_finale', 'commentaire_scolarite', 'commentaire_enseignant']);
        });
    }
};
