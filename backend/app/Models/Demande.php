<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Demande extends Model
{
    // Champs assignables en masse pour une demande
    protected $fillable = [
        'nom_prenom', 'filiere_niveau', 'matiere_id', 'enseignant_id', 'enseignant_nom',
        'objet', 'objectif', 'motif', 'justification', 'statut', 'user_id',
        'note_actuelle', 'note_demandee', 'note_finale', 'commentaire_scolarite', 'commentaire_enseignant'
    ];

    protected $appends = ['justification_url'];

    protected $casts = [
        'statut' => 'string',
    ];

    // Retourne l'URL complète du fichier de justification s'il existe
    public function getJustificationUrlAttribute()
    {
        return $this->justification ? asset('storage/' . $this->justification) : null;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relation : Matière concernée
    public function matiere()
    {
        return $this->belongsTo(Matiere::class);
    }

    public function enseignant()
    {
        return $this->belongsTo(User::class, 'enseignant_id');
    }

    public function historiques()
    {
        return $this->hasMany(HistoriqueAction::class);
    }
}
