<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'filiere_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Relation : Rôle de l'utilisateur
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    // Relation : Filière (uniquement pour les étudiants)
    public function filiere()
    {
        return $this->belongsTo(Filiere::class);
    }

    // Relation : Matières enseignées (uniquement pour les enseignants)
    public function matieres()
    {
        return $this->hasMany(Matiere::class, 'enseignant_id');
    }

    public function demandes()
    {
        return $this->hasMany(Demande::class);
    }

    public function notes()
    {
        return $this->hasMany(Note::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
    public function sendPasswordResetNotification($token)
    {
        $url = env('FRONTEND_URL', 'http://localhost:5173') . '/reset-password?token=' . $token . '&email=' . $this->email;
        $this->notify(new \Illuminate\Auth\Notifications\ResetPassword($token));
        
        // Note: Si vous voulez vraiment personnaliser le lien, il est préferable de créer une notification dédiée.
        // Mais pour simplifier, on s'assure que FRONTEND_URL est bien utilisé par Laravel ou via une notification personnalisée.
    }
}
