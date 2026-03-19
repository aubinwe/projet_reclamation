<?php

namespace App\Mail;

use App\Models\Demande;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ClaimStatusUpdated extends Mailable
{
    use Queueable, SerializesModels;

    public $demande;
    public $customMessage;

    /**
     * Create a new message instance.
     */
    public function __construct(Demande $demande, $customMessage = null)
    {
        $this->demande = $demande;
        $this->customMessage = $customMessage;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $statusLabels = [
            'SOUMISE' => 'Réclamation soumise',
            'RECUE_SCOLARITE' => 'Réclamation reçue par la scolarité',
            'REJETEE_SCOLARITE' => 'Réclamation rejetée',
            'ENVOYEE_DA' => 'Réclamation transmise au Directeur Académique',
            'IMPUTEE_ENSEIGNANT' => 'Réclamation en cours de traitement par l\'enseignant',
            'VALIDEE' => 'Réclamation validée',
            'NON_VALIDEE' => 'Réclamation non validée',
        ];

        $subject = $statusLabels[$this->demande->statut] ?? 'Mise à jour de votre réclamation';

        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.claim_status_updated',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
