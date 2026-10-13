import { defaultLocale, type Locale } from "./config";

export type PortalCopy = {
  metaTitle: string;
  activateTitle: string;
  recoverTitle: string;
  kicker: string;
  backToSite: string;
  logout: string;
  hello: string;
  panelLead: string;
  email: string;
  password: string;
  confirmPassword: string;
  enter: string;
  recover: string;
  loginTitle: string;
  loginLead: string;
  loginHint: string;
  errorDatos: string;
  errorAcceso: string;
  errorInvitacion: string;
  recoverLead: string;
  recoverSend: string;
  recoverBack: string;
  recoverSent: string;
  activateBadLink: string;
  activateBadLead: string;
  activateGoLogin: string;
  activateNewPassword: string;
  activateCreateLead: string;
  activateRule: string;
  activateSave: string;
  activateCreate: string;
  errorMismatch: string;
  errorRequirement: string;
  savedEvent: string;
  savedPhotos: string;
  errorLimit: string;
  errorFile: string;
  tabs: {
    contratante: string;
    acompanantes: string;
    facturacion: string;
    documentacion: string;
    agenda: string;
  };
  yourDetails: string;
  yourDetailsLead: string;
  saveCard: string;
  trialHeading: string;
  trialLead: string;
  companionsTitle: string;
  companionsLead: string;
  companionsTrials: string;
  billingTitle: string;
  billingLead: string;
  docsTitle: string;
  docsLead: string;
  docsEmpty: string;
  download: string;
  agendaTitle: string;
  agendaLead: string;
  yourName: string;
  lastName: string;
  partnerName: string;
  phone: string;
  eventType: string;
  eventTypes: { boda: string; evento: string; otro: string };
  date: string;
  venue: string;
  gettingReadyPlace: string;
  gettingReadyTime: string;
  ceremonyTime: string;
  services: string;
  makeup: string;
  hair: string;
  glitterBar: string;
  beautyCorner: string;
  trialNotes: string;
  skinNotes: string;
  extraNotes: string;
  inspiration: string;
  attachPhotos: string;
  uploading: string;
  peopleCount: string;
  personN: string;
  who: string;
  choose: string;
  service: string;
  allergies: string;
  wantsTrial: string;
  noCompanions: string;
  saveCompanions: string;
  whoOptions: Record<string, string>;
  serviceOptions: Record<string, string>;
  contractor: string;
  guestN: string;
  deposit: string;
  trialDay: string;
  eventDay: string;
  paid: string;
  unpaid: string;
  pending: string;
  productsUsed: string;
  productsEmpty: string;
  trialPhotos: string;
  trialPhotosEmpty: string;
  remove: string;
  removeConfirm: string;
  agendaEmpty: string;
  noDate: string;
  appointment: string;
  appointmentTitles: Record<string, string>;
  statuses: {
    planificada: string;
    confirmada: string;
    hecha: string;
  };
  documentKinds: Record<string, string>;
  recoverMailSubject: string;
  recoverMailHello: string;
  recoverMailIntro: string;
  recoverMailBody: string;
  recoverMailLink: string;
  recoverMailExpiry: string;
  recoverMailIgnore: string;
  recoverMailSignoff: string;
  lockedLead: string;
  notifyChanges: string;
  notifyChangesLead: string;
  notifyPlaceholder: string;
  changeSent: string;
  changeError: string;
  trialYes: string;
  trialNo: string;
  mailHello: string;
  mailSignoff: string;
  replyMailSubject: string;
  replyMailHello: string;
  replyMailIntro: string;
  replyMailBody: string;
  replyMailLink: string;
  replyMailClose: string;
  replyMailSignoff: string;
  updateMailSubject: string;
  updateMailHello: string;
  updateMailIntro: string;
  updateMailBody: string;
  updateMailLink: string;
  updateMailClose: string;
  updateMailSignoff: string;
};

export const portalEs: PortalCopy = {
  metaTitle: "Tu área de clientes",
  activateTitle: "Activar área clientes",
  recoverTitle: "Recuperar contraseña",
  kicker: "Área clientes",
  backToSite: "Volver a la web",
  logout: "Salir",
  hello: "Hola, {name}.",
  panelLead: "Tu ficha, la de tus acompañantes, los pagos, los papeles y la agenda de citas.",
  email: "Correo",
  password: "Contraseña",
  confirmPassword: "Repite la contraseña",
  enter: "Entrar",
  recover: "Recuperar contraseña",
  loginTitle: "Tu espacio de inspiración",
  loginLead:
    "Inicia sesión con el correo electrónico que me facilitaste y la contraseña que creaste al activar tu invitación. Aquí encontrarás la ficha de tu evento, tus fotos de inspiración y todos los documentos que vayamos compartiendo.",
  loginHint:
    "¿Aún no tienes acceso? Escríbeme y te enviaré tu invitación. Por seguridad y privacidad, las cuentas son personales y las gestiono yo misma para cada una de vosotras.",
  errorDatos: "Revisa el correo y la contraseña.",
  errorAcceso: "No reconocemos esa cuenta. Si acabas de recibir la invitación, actívala primero.",
  errorInvitacion: "Ese enlace ya no es válido. Pídeme uno nuevo por WhatsApp o correo.",
  recoverLead:
    "Escribe el correo de tu cuenta. Si está en el sistema, te enviaré un enlace para elegir una nueva.",
  recoverSend: "Enviar enlace",
  recoverBack: "Volver al acceso",
  recoverSent:
    "Si ese correo tiene cuenta, recibirás un enlace para crear una contraseña nueva. Revisa también la carpeta de correo no deseado.",
  activateBadLink: "Este enlace no sirve.",
  activateBadLead: "Pídeme un enlace nuevo. Caduca a las tres semanas o cuando ya lo hayas usado.",
  activateGoLogin: "Ir al acceso",
  activateNewPassword: "Elige una contraseña nueva para {email}.",
  activateCreateLead:
    "Tu usuario será {email}. Elige una contraseña que solo tú conozcas; la necesitarás cada vez que entres a tu área.",
  activateRule: "Al menos 10 caracteres, con una letra y un número.",
  activateSave: "Guardar contraseña",
  activateCreate: "Crear acceso",
  errorMismatch: "Las dos contraseñas no coinciden.",
  errorRequirement: "Mínimo 10 caracteres, con letra y número.",
  savedEvent: "He guardado la ficha.",
  savedPhotos: "Las fotos ya están en tu espacio.",
  errorLimit: "Puedes colgar hasta {max} fotos de inspiración.",
  errorFile: "Ese archivo no sirve (usa JPG, PNG o WebP, máximo 8 MB).",
  tabs: {
    contratante: "Contratante",
    acompanantes: "Acompañantes",
    facturacion: "Facturación",
    documentacion: "Documentación",
    agenda: "Agenda",
  },
  yourDetails: "Tus datos",
  yourDetailsLead: "Cuanto más concreto, más fácil organizo horarios y equipo.",
  saveCard: "Guardar ficha",
  trialHeading: "Prueba",
  trialLead: "Aquí verás las fotos que haga el día de la prueba y los productos que hayamos usado.",
  companionsTitle: "Acompañantes",
  companionsLead:
    "El número de personas abre una ficha por cada una. Alergias y notas van siempre; las notas de la prueba, sólo si la marcan.",
  companionsTrials: "Pruebas de acompañantes",
  billingTitle: "Facturación y pagos",
  billingLead:
    "Reserva, prueba y día del evento. Yo anoto los importes y si están abonados; aquí ves lo pendiente.",
  docsTitle: "Presupuestos, contratos y papeles",
  docsLead: "Aquí cuelgo presupuestos, contratos y el resto de documentación.",
  docsEmpty: "Aún no hay documentos. Cuando haya presupuesto o contrato, aparecerá aquí.",
  download: "Descargar",
  agendaTitle: "Agenda",
  agendaLead: "Las citas que tenemos planificadas: prueba, evento y lo que vayamos sumando.",
  yourName: "Nombre",
  lastName: "Apellidos",
  partnerName: "Nombre de tu pareja",
  phone: "Teléfono",
  eventType: "Tipo de evento",
  eventTypes: { boda: "Boda", evento: "Evento", otro: "Otro" },
  date: "Fecha",
  venue: "Lugar de la celebración",
  gettingReadyPlace: "Dónde os preparáis",
  gettingReadyTime: "Hora de prepararos",
  ceremonyTime: "Hora de ceremonia o inicio",
  services: "Servicios",
  makeup: "Maquillaje",
  hair: "Peinado",
  glitterBar: "Glitter Bar",
  beautyCorner: "Beauty Corner",
  trialNotes: "Notas para la prueba",
  skinNotes: "Piel, alergias o sensibilidad",
  extraNotes: "Lo que quieras que sepa",
  inspiration: "Inspiraciones",
  attachPhotos: "Adjuntar fotos",
  uploading: "Subiendo…",
  peopleCount: "Nº de personas a atender",
  personN: "Persona {n}",
  who: "Quién es",
  choose: "Elige…",
  service: "Servicio",
  allergies: "Alergias o sensibilidad",
  wantsTrial: "Quiere prueba",
  noCompanions: "Si no hay acompañantes, deja este número en 0.",
  saveCompanions: "Guardar acompañantes",
  whoOptions: {
    "Pareja masculina": "Pareja masculina",
    "Pareja femenina": "Pareja femenina",
    "Madrina/padrino": "Madrina/padrino",
    "Niñ@": "Niñ@",
    Invitada: "Invitada",
    Invitado: "Invitado",
  },
  serviceOptions: {
    "Maquillaje y peinado": "Maquillaje y peinado",
    "Sólo maquillaje": "Sólo maquillaje",
    "Sólo peinado": "Sólo peinado",
  },
  contractor: "Contratante",
  guestN: "Acompañante {n}",
  deposit: "Reserva",
  trialDay: "Día de la prueba",
  eventDay: "Día del evento",
  paid: "Abonado",
  unpaid: "Pendiente de pagar",
  pending: "Pendiente de pagar: {amount}",
  productsUsed: "Productos utilizados",
  productsEmpty: "Aún no hay productos anotados.",
  trialPhotos: "Fotos de la prueba",
  trialPhotosEmpty: "Todavía no hay fotos de la prueba.",
  remove: "Quitar",
  removeConfirm: "¿Quitar este archivo?",
  agendaEmpty: "Todavía no hay citas en la agenda.",
  noDate: "Sin fecha",
  appointment: "Cita",
  appointmentTitles: {
    Prueba: "Prueba",
    Evento: "Evento",
    Reserva: "Reserva",
    Otra: "Otra",
  },
  statuses: {
    planificada: "Planificada",
    confirmada: "Confirmada",
    hecha: "Hecha",
  },
  documentKinds: {
    Presupuesto: "Presupuesto",
    Contrato: "Contrato",
    Factura: "Factura",
    Anexo: "Anexo",
    Timeline: "Timeline",
    Otro: "Otro",
  },
  recoverMailSubject: "Restablece tu contraseña de acceso | Many Makeups by Ana Zarza",
  recoverMailHello: "Hola {name}:",
  recoverMailIntro:
    "He recibido una solicitud para restablecer la contraseña de tu área privada en Many Makeups.",
  recoverMailBody:
    "Para elegir una nueva clave y volver a acceder a tu espacio, solo tienes que hacer clic en el siguiente enlace:",
  recoverMailLink: "Restablecer mi contraseña",
  recoverMailExpiry: "(Este enlace caducará en 3 semanas por motivos de seguridad).",
  recoverMailIgnore:
    "Si tú no has solicitado este cambio, puedes ignorar este mensaje; tu contraseña seguirá siendo la misma.",
  recoverMailSignoff: "Un abrazo,",
  lockedLead:
    "Esta ficha ya está guardada y no se puede editar. Si algo cambia, escríbeme aquí y me llegará al estudio.",
  notifyChanges: "Notificar cambios",
  notifyChangesLead: "Cuéntame qué hay que cambiar",
  notifyPlaceholder: "Fecha, hora, lugar, servicio…",
  changeSent: "He recibido tu aviso. Lo veré en el estudio.",
  changeError: "Escribe al menos unas palabras para que sepa qué cambiar.",
  trialYes: "Quiere prueba",
  trialNo: "Sin prueba",
  mailHello: "Hola, {name}.",
  mailSignoff: "Un abrazo,",
  replyMailSubject: "Tienes una nueva respuesta en tu área privada | Many Makeups",
  replyMailHello: "Hola {name}:",
  replyMailIntro: "Te he dejado una nueva respuesta a tu mensaje dentro de tu espacio privado.",
  replyMailBody: "Puedes leer la respuesta completa y continuar nuestra conversación haciendo clic aquí:",
  replyMailLink: "Ver mensaje en mi área privada",
  replyMailClose: "Nos leemos dentro. ¡Seguimos preparando cada detalle!",
  replyMailSignoff: "Un abrazo,",
  updateMailSubject: "He actualizado la ficha de tu evento | Many Makeups by Ana Zarza",
  updateMailHello: "Hola {name}:",
  updateMailIntro:
    "Te escribo para avisarte de que he realizado una actualización en la ficha de tu evento en tu área privada (he añadido nuevos detalles, documentos o ajustes en tu planificación tal y como me has solicitado).",
  updateMailBody: "Puedes revisar las novedades directamente desde tu panel de acceso:",
  updateMailLink: "Acceder a mi ficha de cliente",
  updateMailClose:
    "Así me aseguro de que todo esté perfectamente alineado para tu gran día. Si ves cualquier detalle que quieras ajustar, solo dímelo.",
  updateMailSignoff: "Un saludo,",
};

export const portalEn: PortalCopy = {
  ...portalEs,
  metaTitle: "Your client area",
  activateTitle: "Activate client area",
  recoverTitle: "Reset password",
  kicker: "Client area",
  backToSite: "Back to the site",
  logout: "Log out",
  hello: "Hello, {name}.",
  panelLead: "Your details, your guests, payments, documents and the appointment diary.",
  email: "Email",
  password: "Password",
  confirmPassword: "Repeat password",
  enter: "Sign in",
  recover: "Forgot password",
  loginTitle: "Your inspiration space",
  loginLead:
    "Sign in with the email you gave me and the password you created when you activated your invitation. Here you will find your event details, inspiration photos and every document we share.",
  loginHint:
    "No access yet? Write to me and I will send your invitation. For privacy, accounts are personal and I set them up myself for each of you.",
  errorDatos: "Please check the email and password.",
  errorAcceso: "We do not recognise that account. If you have just received the invitation, activate it first.",
  errorInvitacion: "That link is no longer valid. Ask me for a new one by WhatsApp or email.",
  recoverLead: "Enter the email for your account. If it is in the system, I will send a link to choose a new password.",
  recoverSend: "Send link",
  recoverBack: "Back to sign in",
  recoverSent:
    "If that email has an account, you will receive a link to create a new password. Please check spam as well.",
  activateBadLink: "This link does not work.",
  activateBadLead: "Ask me for a new link. It expires after three weeks, or once you have used it.",
  activateGoLogin: "Go to sign in",
  activateNewPassword: "Choose a new password for {email}.",
  activateCreateLead:
    "Your username will be {email}. Choose a password only you know; you will need it each time you enter your area.",
  activateRule: "At least 10 characters, including a letter and a number.",
  activateSave: "Save password",
  activateCreate: "Create access",
  errorMismatch: "The two passwords do not match.",
  errorRequirement: "Minimum 10 characters, with a letter and a number.",
  savedEvent: "I have saved the details.",
  savedPhotos: "The photos are now in your space.",
  errorLimit: "You can upload up to {max} inspiration photos.",
  errorFile: "That file will not work (use JPG, PNG or WebP, 8 MB max).",
  tabs: {
    contratante: "You",
    acompanantes: "Guests",
    facturacion: "Billing",
    documentacion: "Documents",
    agenda: "Diary",
  },
  yourDetails: "Your details",
  yourDetailsLead: "The more specific you are, the easier it is to plan timing and team.",
  saveCard: "Save details",
  trialHeading: "Trial",
  trialLead: "Here you will see the photos from the trial and the products we used.",
  companionsTitle: "Guests",
  companionsLead:
    "The number of people opens a card for each one. Allergies and notes are always there; trial notes only if they want a trial.",
  companionsTrials: "Guest trials",
  billingTitle: "Billing and payments",
  billingLead: "Deposit, trial and event day. I enter the amounts and whether they are paid; here you see what is outstanding.",
  docsTitle: "Quotes, contracts and papers",
  docsLead: "I upload quotes, contracts and the rest of the paperwork here.",
  docsEmpty: "No documents yet. When there is a quote or contract, it will appear here.",
  download: "Download",
  agendaTitle: "Diary",
  agendaLead: "The appointments we have planned: trial, event, and anything we add.",
  yourName: "First name",
  lastName: "Last name",
  partnerName: "Your partner’s name",
  phone: "Phone",
  eventType: "Type of event",
  eventTypes: { boda: "Wedding", evento: "Event", otro: "Other" },
  date: "Date",
  venue: "Venue",
  gettingReadyPlace: "Where you get ready",
  gettingReadyTime: "Getting-ready time",
  ceremonyTime: "Ceremony or start time",
  services: "Services",
  makeup: "Makeup",
  hair: "Hair",
  glitterBar: "Glitter Bar",
  beautyCorner: "Beauty Corner",
  trialNotes: "Notes for the trial",
  skinNotes: "Skin, allergies or sensitivity",
  extraNotes: "Anything else I should know",
  inspiration: "Inspiration",
  attachPhotos: "Attach photos",
  uploading: "Uploading…",
  peopleCount: "Number of people to style",
  personN: "Person {n}",
  who: "Who they are",
  choose: "Choose…",
  service: "Service",
  allergies: "Allergies or sensitivity",
  wantsTrial: "Wants a trial",
  noCompanions: "If there are no guests, leave this number at 0.",
  saveCompanions: "Save guests",
  whoOptions: {
    "Pareja masculina": "Male partner",
    "Pareja femenina": "Female partner",
    "Madrina/padrino": "Maid of honour / best man",
    "Niñ@": "Child",
    Invitada: "Female guest",
    Invitado: "Male guest",
  },
  serviceOptions: {
    "Maquillaje y peinado": "Makeup and hair",
    "Sólo maquillaje": "Makeup only",
    "Sólo peinado": "Hair only",
  },
  contractor: "Client",
  guestN: "Guest {n}",
  deposit: "Deposit",
  trialDay: "Trial day",
  eventDay: "Event day",
  paid: "Paid",
  unpaid: "Outstanding",
  pending: "Outstanding: {amount}",
  productsUsed: "Products used",
  productsEmpty: "No products noted yet.",
  trialPhotos: "Trial photos",
  trialPhotosEmpty: "No trial photos yet.",
  remove: "Remove",
  removeConfirm: "Remove this file?",
  agendaEmpty: "There are no appointments in the diary yet.",
  noDate: "No date",
  appointment: "Appointment",
  appointmentTitles: {
    Prueba: "Trial",
    Evento: "Event",
    Reserva: "Deposit",
    Otra: "Other",
  },
  statuses: {
    planificada: "Planned",
    confirmada: "Confirmed",
    hecha: "Done",
  },
  documentKinds: {
    Presupuesto: "Quote",
    Contrato: "Contract",
    Factura: "Invoice",
    Anexo: "Annex",
    Timeline: "Timeline",
    Otro: "Other",
  },
  recoverMailSubject: "Reset your access password | Many Makeups by Ana Zarza",
  recoverMailHello: "Hello, {name}:",
  recoverMailIntro: "I have received a request to reset the password for your private area at Many Makeups.",
  recoverMailBody: "To choose a new password and get back into your space, just click the link below:",
  recoverMailLink: "Reset my password",
  recoverMailExpiry: "(This link will expire in 3 weeks for security reasons).",
  recoverMailIgnore: "If you did not request this change, you can ignore this message; your password will stay the same.",
  recoverMailSignoff: "With love,",
  lockedLead:
    "This form is saved and can no longer be edited. If something changes, write it here and it will reach the studio.",
  notifyChanges: "Request a change",
  notifyChangesLead: "Tell me what needs to change",
  notifyPlaceholder: "Date, time, venue, service…",
  changeSent: "I have received your note. I will see it in the studio.",
  changeError: "Please write a few words so I know what to change.",
  trialYes: "Wants a trial",
  trialNo: "No trial",
  mailHello: "Hello, {name}.",
  mailSignoff: "With love,",
  replyMailSubject: "You have a new reply in your private area | Many Makeups",
  replyMailHello: "Hello {name}:",
  replyMailIntro: "I have left a new reply to your message in your private area.",
  replyMailBody: "You can read the full reply and continue our conversation by clicking here:",
  replyMailLink: "View the message in my private area",
  replyMailClose: "I'll see you in there. We keep preparing every detail!",
  replyMailSignoff: "With love,",
  updateMailSubject: "I have updated your event details | Many Makeups by Ana Zarza",
  updateMailHello: "Hello {name}:",
  updateMailIntro:
    "I am writing to let you know that I have updated your event details in your private area (I have added new details, documents or adjustments to your plan, as you asked).",
  updateMailBody: "You can review what is new directly from your access panel:",
  updateMailLink: "Open my client details",
  updateMailClose:
    "This way I can make sure everything is lined up for your big day. If you see anything you would like to adjust, just tell me.",
  updateMailSignoff: "Best regards,",
};

export const portalFr: PortalCopy = {
  ...portalEs,
  metaTitle: "Ton espace clientes",
  activateTitle: "Activer l’espace clientes",
  recoverTitle: "Récupérer le mot de passe",
  kicker: "Espace clientes",
  backToSite: "Retour au site",
  logout: "Sortir",
  hello: "Bonjour, {name}.",
  panelLead: "Ta fiche, celle de tes accompagnants, les paiements, les papiers et l’agenda des rendez-vous.",
  email: "E-mail",
  password: "Mot de passe",
  confirmPassword: "Répète le mot de passe",
  enter: "Entrer",
  recover: "Récupérer le mot de passe",
  loginTitle: "Ton espace d’inspiration",
  loginLead:
    "Connecte-toi avec l’e-mail que tu m’as donné et le mot de passe créé à l’activation de ton invitation. Tu y trouveras la fiche de ton événement, tes photos d’inspiration et tous les documents que nous partagerons.",
  loginHint:
    "Pas encore d’accès ? Écris-moi et je t’enverrai ton invitation. Pour la confidentialité, les comptes sont personnels et je les crée moi-même pour chacune de vous.",
  errorDatos: "Vérifie l’e-mail et le mot de passe.",
  errorAcceso: "Nous ne reconnaissons pas ce compte. Si tu viens de recevoir l’invitation, active-la d’abord.",
  errorInvitacion: "Ce lien n’est plus valable. Demande-m’en un nouveau par WhatsApp ou e-mail.",
  recoverLead:
    "Indique l’e-mail de ton compte. S’il est dans le système, je t’enverrai un lien pour en choisir un nouveau.",
  recoverSend: "Envoyer le lien",
  recoverBack: "Retour à la connexion",
  recoverSent:
    "Si cet e-mail a un compte, tu recevras un lien pour créer un nouveau mot de passe. Vérifie aussi les indésirables.",
  activateBadLink: "Ce lien ne fonctionne pas.",
  activateBadLead: "Demande-moi un nouveau lien. Il expire au bout de trois semaines, ou dès que tu l’as utilisé.",
  activateGoLogin: "Aller à la connexion",
  activateNewPassword: "Choisis un nouveau mot de passe pour {email}.",
  activateCreateLead:
    "Ton identifiant sera {email}. Choisis un mot de passe que toi seule connais ; tu en auras besoin à chaque visite.",
  activateRule: "Au moins 10 caractères, avec une lettre et un chiffre.",
  activateSave: "Enregistrer le mot de passe",
  activateCreate: "Créer l’accès",
  errorMismatch: "Les deux mots de passe ne correspondent pas.",
  errorRequirement: "Minimum 10 caractères, avec une lettre et un chiffre.",
  savedEvent: "J’ai enregistré la fiche.",
  savedPhotos: "Les photos sont dans ton espace.",
  errorLimit: "Tu peux ajouter jusqu’à {max} photos d’inspiration.",
  errorFile: "Ce fichier ne convient pas (JPG, PNG ou WebP, 8 Mo max).",
  tabs: {
    contratante: "Toi",
    acompanantes: "Accompagnants",
    facturacion: "Facturation",
    documentacion: "Documents",
    agenda: "Agenda",
  },
  yourDetails: "Tes informations",
  yourDetailsLead: "Plus c’est précis, plus j’organise facilement les horaires et l’équipe.",
  saveCard: "Enregistrer la fiche",
  trialHeading: "Essai",
  trialLead: "Tu verras ici les photos du jour de l’essai et les produits utilisés.",
  companionsTitle: "Accompagnants",
  companionsLead:
    "Le nombre de personnes ouvre une fiche pour chacune. Allergies et notes sont toujours là ; les notes d’essai seulement si elles le demandent.",
  companionsTrials: "Essais des accompagnants",
  billingTitle: "Facturation et paiements",
  billingLead:
    "Acompte, essai et jour de l’événement. J’inscris les montants et s’ils sont payés ; tu vois ici le reste à régler.",
  docsTitle: "Devis, contrats et papiers",
  docsLead: "J’y dépose les devis, contrats et le reste des documents.",
  docsEmpty: "Pas encore de documents. Quand il y aura un devis ou un contrat, il apparaîtra ici.",
  download: "Télécharger",
  agendaTitle: "Agenda",
  agendaLead: "Les rendez-vous prévus : essai, événement, et ce que nous ajouterons.",
  yourName: "Prénom",
  lastName: "Nom",
  partnerName: "Prénom de ta/ton partenaire",
  phone: "Téléphone",
  eventType: "Type d’événement",
  eventTypes: { boda: "Mariage", evento: "Événement", otro: "Autre" },
  date: "Date",
  venue: "Lieu de la célébration",
  gettingReadyPlace: "Où vous vous préparez",
  gettingReadyTime: "Heure de préparation",
  ceremonyTime: "Heure de la cérémonie ou du début",
  services: "Services",
  makeup: "Maquillage",
  hair: "Coiffure",
  glitterBar: "Glitter Bar",
  beautyCorner: "Beauty Corner",
  trialNotes: "Notes pour l’essai",
  skinNotes: "Peau, allergies ou sensibilité",
  extraNotes: "Ce que tu veux que je sache",
  inspiration: "Inspirations",
  attachPhotos: "Joindre des photos",
  uploading: "Envoi…",
  peopleCount: "Nombre de personnes à coiffer / maquiller",
  personN: "Personne {n}",
  who: "Qui c’est",
  choose: "Choisis…",
  service: "Service",
  allergies: "Allergies ou sensibilité",
  wantsTrial: "Souhaite un essai",
  noCompanions: "S’il n’y a pas d’accompagnants, laisse ce nombre à 0.",
  saveCompanions: "Enregistrer les accompagnants",
  whoOptions: {
    "Pareja masculina": "Partenaire masculin",
    "Pareja femenina": "Partenaire féminine",
    "Madrina/padrino": "Demoiselle / garçon d’honneur",
    "Niñ@": "Enfant",
    Invitada: "Invitée",
    Invitado: "Invité",
  },
  serviceOptions: {
    "Maquillaje y peinado": "Maquillage et coiffure",
    "Sólo maquillaje": "Maquillage seulement",
    "Sólo peinado": "Coiffure seulement",
  },
  contractor: "Cliente",
  guestN: "Accompagnant {n}",
  deposit: "Acompte",
  trialDay: "Jour de l’essai",
  eventDay: "Jour de l’événement",
  paid: "Payé",
  unpaid: "Reste à payer",
  pending: "Reste à payer : {amount}",
  productsUsed: "Produits utilisés",
  productsEmpty: "Aucun produit noté pour l’instant.",
  trialPhotos: "Photos de l’essai",
  trialPhotosEmpty: "Pas encore de photos de l’essai.",
  remove: "Retirer",
  removeConfirm: "Retirer ce fichier ?",
  agendaEmpty: "Il n’y a pas encore de rendez-vous dans l’agenda.",
  noDate: "Sans date",
  appointment: "Rendez-vous",
  appointmentTitles: {
    Prueba: "Essai",
    Evento: "Événement",
    Reserva: "Acompte",
    Otra: "Autre",
  },
  statuses: {
    planificada: "Planifié",
    confirmada: "Confirmé",
    hecha: "Fait",
  },
  documentKinds: {
    Presupuesto: "Devis",
    Contrato: "Contrat",
    Factura: "Facture",
    Anexo: "Annexe",
    Timeline: "Planning",
    Otro: "Autre",
  },
  recoverMailSubject: "Réinitialise ton mot de passe d'accès | Many Makeups by Ana Zarza",
  recoverMailHello: "Bonjour, {name} :",
  recoverMailIntro:
    "J’ai reçu une demande pour réinitialiser le mot de passe de ton espace privé chez Many Makeups.",
  recoverMailBody:
    "Pour choisir un nouveau mot de passe et retrouver ton espace, il te suffit de cliquer sur le lien suivant :",
  recoverMailLink: "Réinitialiser mon mot de passe",
  recoverMailExpiry: "(Ce lien expirera dans 3 semaines pour des raisons de sécurité).",
  recoverMailIgnore:
    "Si tu n’as pas demandé ce changement, tu peux ignorer ce message ; ton mot de passe restera le même.",
  recoverMailSignoff: "Je t’embrasse,",
  lockedLead:
    "Cette fiche est enregistrée et ne peut plus être modifiée. Si quelque chose change, écris-le ici et je le verrai à l’atelier.",
  notifyChanges: "Signaler un changement",
  notifyChangesLead: "Dis-moi ce qu’il faut changer",
  notifyPlaceholder: "Date, heure, lieu, service…",
  changeSent: "J’ai reçu ton message. Je le verrai à l’atelier.",
  changeError: "Écris quelques mots pour que je sache quoi changer.",
  trialYes: "Souhaite un essai",
  trialNo: "Sans essai",
  mailHello: "Bonjour, {name}.",
  mailSignoff: "Je t’embrasse,",
  replyMailSubject: "Tu as une nouvelle réponse dans ton espace privé | Many Makeups",
  replyMailHello: "Bonjour {name} :",
  replyMailIntro: "Je t’ai laissé une nouvelle réponse à ton message dans ton espace privé.",
  replyMailBody: "Tu peux lire la réponse complète et continuer notre conversation en cliquant ici :",
  replyMailLink: "Voir le message dans mon espace privé",
  replyMailClose: "On se lit dedans. On continue à préparer chaque détail !",
  replyMailSignoff: "Je t’embrasse,",
  updateMailSubject: "J’ai mis à jour la fiche de ton événement | Many Makeups by Ana Zarza",
  updateMailHello: "Bonjour {name} :",
  updateMailIntro:
    "Je t’écris pour te dire que j’ai mis à jour la fiche de ton événement dans ton espace privé (j’ai ajouté de nouveaux détails, des documents ou des ajustements à ta planification, comme tu me l’as demandé).",
  updateMailBody: "Tu peux voir les nouveautés directement depuis ton espace :",
  updateMailLink: "Accéder à ma fiche",
  updateMailClose:
    "Comme ça, je m’assure que tout est aligné pour ton grand jour. Si tu vois un détail à ajuster, dis-le-moi.",
  updateMailSignoff: "Bien à toi,",
};

const catalog: Record<Locale, PortalCopy> = {
  es: portalEs,
  en: portalEn,
  fr: portalFr,
};

export function getPortalCopy(locale: Locale = defaultLocale): PortalCopy {
  return catalog[locale] ?? portalEs;
}

export function interpolate(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ""));
}

export function dateLocale(locale: Locale) {
  if (locale === "en") return "en-GB";
  if (locale === "fr") return "fr-FR";
  return "es-ES";
}
