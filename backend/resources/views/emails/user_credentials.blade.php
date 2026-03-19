<x-mail::message>
# Bienvenue chez IBAM, {{ $user_name }} !

Votre compte a été créé avec succès sur la plateforme de Gestion des Réclamations.

Voici vos identifiants de connexion :

**Email :** {{ $email }}  
**Mot de passe :** {{ $password }}

<x-mail::button :url="config('app.url')">
Se connecter à la plateforme
</x-mail::button>

Pour des raisons de sécurité, nous vous recommandons de changer votre mot de passe dès votre première connexion.

Merci,  
L'équipe IBAM
</x-mail::message>
