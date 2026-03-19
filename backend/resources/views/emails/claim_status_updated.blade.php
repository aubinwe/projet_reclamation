<!DOCTYPE html>
<html>
<head>
    <title>Mise à jour de votre réclamation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #0d9488;">Mise à jour de votre réclamation</h2>
        <p>Bonjour <strong>{{ $demande->nom_prenom }}</strong>,</p>
        
        <p>Le statut de votre réclamation concernant la matière <strong>{{ $demande->matiere->name ?? 'Non spécifié' }}</strong> a évolué.</p>
        
        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #0d9488;">
            <p><strong>Nouveau statut :</strong> 
                @switch($demande->statut)
                    @case('RECUE_SCOLARITE')
                        <span style="color: #0d9488; font-weight: bold;">Reçue par la scolarité</span>
                        @break
                    @case('REJETEE_SCOLARITE')
                        <span style="color: #ef4444; font-weight: bold;">Rejetée par la scolarité</span>
                        @break
                    @case('ENVOYEE_DA')
                        <span style="color: #f59e0b; font-weight: bold;">Transmise au Directeur Académique</span>
                        @break
                    @case('IMPUTEE_ENSEIGNANT')
                        <span style="color: #3b82f6; font-weight: bold;">En cours de traitement (Chez l'enseignant)</span>
                        @break
                    @case('VALIDEE')
                        <span style="color: #10b981; font-weight: bold;">Validée</span>
                        @break
                    @case('NON_VALIDEE')
                        <span style="color: #ef4444; font-weight: bold;">Non validée</span>
                        @break
                    @default
                        <span style="font-weight: bold;">{{ $demande->statut }}</span>
                @endswitch
            </p>
            
            @if($customMessage)
                <p><strong>Message :</strong> {{ $customMessage }}</p>
            @endif

            @if($demande->statut === 'VALIDEE' && $demande->note_finale)
                <p><strong>Nouvelle note :</strong> {{ $demande->note_finale }}</p>
            @endif

            @if($demande->commentaire_scolarite && ($demande->statut === 'REJETEE_SCOLARITE' || $demande->statut === 'RECUE_SCOLARITE'))
                <p><strong>Commentaire scolarité :</strong> {{ $demande->commentaire_scolarite }}</p>
            @endif

            @if($demande->commentaire_enseignant && ($demande->statut === 'VALIDEE' || $demande->statut === 'NON_VALIDEE'))
                <p><strong>Commentaire enseignant :</strong> {{ $demande->commentaire_enseignant }}</p>
            @endif
        </div>

        <p>
            <a href="{{ env('FRONTEND_URL') }}/claims" style="display: inline-block; padding: 10px 20px; background-color: #0d9488; color: white; text-decoration: none; border-radius: 5px;">
                Consulter ma réclamation
            </a>
        </p>
        
        <p style="font-size: 12px; color: #777; margin-top: 30px;">
            Ceci est un message automatique.
        </p>
    </div>
</body>
</html>
