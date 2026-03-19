<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = ['user_id', 'message', 'type', 'read_at', 'demande_id'];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function demande()
    {
        return $this->belongsTo(Demande::class);
    }

    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }
}
