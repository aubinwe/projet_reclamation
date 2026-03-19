<!DOCTYPE html>
<html>
<head>
    <title>Bienvenue à l'IBAM</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #0d9488;">Bienvenue sur la plateforme de réclamations de l'IBAM</h2>
        <p>Bonjour <strong>{{ $user->name }}</strong>,</p>
        <p>Votre compte a été créé avec succès.</p>
        <p>Vous pouvez désormais vous connecter pour soumettre et suivre vos réclamations de notes.</p>
        <p>
            <a href="{{ env('FRONTEND_URL') }}" style="display: inline-block; padding: 10px 20px; background-color: #0d9488; color: white; text-decoration: none; border-radius: 5px;">
                Accéder à mon espace
            </a>
        </p>
        <p>Si vous avez des questions, n'hésitez pas à contacter le service de la scolarité.</p>
        <p style="font-size: 12px; color: #777; margin-top: 30px;">
            Ceci est un message automatique, merci de ne pas y répondre directement.
        </p>
    </div>
</body>
</html>
