<!DOCTYPE html>
<html>
<head>
    <title>Confirmation de réclamation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #0d9488;">Accusé de réception de votre réclamation</h2>
        <p>Bonjour,</p>
        <p>Nous confirmons la réception de votre réclamation concernant la matière <strong>{{ $demande->matiere->name ?? 'Non spécifié' }}</strong>.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Objet :</strong> {{ $demande->objet }}</p>
            <p><strong>Date de soumission :</strong> {{ $demande->created_at->format('d/m/Y H:i') }}</p>
            <p><strong>Statut actuel :</strong> <span style="color: #f59e0b;">En attente de traitement</span></p>
        </div>

        <p>Votre demande a été transmise au service de la scolarité pour examen. Vous serez notifié de l'avancement du traitement.</p>
        
        <p>
            <a href="{{ env('FRONTEND_URL') }}/claims" style="display: inline-block; padding: 10px 20px; background-color: #0d9488; color: white; text-decoration: none; border-radius: 5px;">
                Suivre ma réclamation
            </a>
        </p>
        
        <p style="font-size: 12px; color: #777; margin-top: 30px;">
            Ceci est un message automatique, merci de ne pas y répondre directement.
        </p>
    </div>
</body>
</html>
