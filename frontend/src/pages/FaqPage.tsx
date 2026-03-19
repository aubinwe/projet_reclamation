import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <Card className="border-2 border-accent">
          <CardHeader>
            <CardTitle>FAQ</CardTitle>
            <CardDescription>
              Guide rapide pour comprendre le fonctionnement de la plateforme de gestion des réclamations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>À quoi sert ce site ?</AccordionTrigger>
                <AccordionContent>
                  Ce site permet aux étudiants de déposer une réclamation (par exemple sur une note), de suivre son traitement
                  et de recevoir une réponse officielle.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>Comment créer un compte ?</AccordionTrigger>
                <AccordionContent>
                  Cliquez sur le lien "Créer un compte" en bas de la page de connexion. Remplissez le formulaire avec vos
                  informations (Nom, Email, Filière, etc.) et choisissez votre mot de passe. Un email de confirmation vous sera envoyé.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>Comment se connecter ?</AccordionTrigger>
                <AccordionContent>
                  Sur la page de connexion, sélectionnez votre profil (Étudiant, Enseignant, Scolarité, Administrateur), puis
                  saisissez votre email et votre mot de passe.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>Comment déposer une réclamation ?</AccordionTrigger>
                <AccordionContent>
                  Après connexion, allez dans "Réclamations" puis "Nouvelle réclamation". Sélectionnez la matière et
                  remplissez les informations demandées (motif, note actuelle, note demandée, etc.), puis validez.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>Qui traite ma réclamation ?</AccordionTrigger>
                <AccordionContent>
                  La réclamation est transmise à l'enseignant responsable de la matière (s'il est assigné) et/ou au service
                  concerné selon le workflow mis en place.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger>Comment suivre l’état de ma réclamation ?</AccordionTrigger>
                <AccordionContent>
                  Vous pouvez consulter la liste de vos réclamations et ouvrir le détail d'une réclamation pour voir son état,
                  l'historique et la réponse.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7">
                <AccordionTrigger>Je n’arrive pas à me connecter / mot de passe oublié</AccordionTrigger>
                <AccordionContent>
                  Utilisez le lien "Oublié ?" sur la page de connexion pour réinitialiser votre mot de passe. Si le problème
                  persiste, contactez l'administration.
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="flex items-center justify-between gap-3">
              <Button variant="outline" asChild>
                <Link to="/">Retour à la connexion</Link>
              </Button>
              <Button className="bg-gradient-accent text-accent-foreground" asChild>
                <Link to="/register">Créer un compte</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
