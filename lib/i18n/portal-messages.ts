import { defaultLocale, type Locale } from "./config";

export type PortalCopy = {
  metaTitle: string;
  activateTitle: string;
  recoverTitle: string;
  kicker: string;
  backToSite: string;
  menu: string;
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
    documentacion: string;
    agenda: string;
    historico: string;
    budget: string;
  };
  yourDetails: string;
  yourDetailsLead: string;
  saveCard: string;
  trialHeading: string;
  trialLead: string;
  planningTab: string;
  planningDownload: string;
  planningLocation: string;
  planningAddress: string;
  planningArrival: string;
  planningArrivalShort: string;
  planningAt: string;
  planningFromTo: string;
  planningRange: string;
  planningPending: string;
  planningCashNote: string;
  planningSet: string;
  planningSchedule: string;
  planningBreaks: string;
  planningPack: string;
  planningNotes: string;
  planningExtra: string;
  planningVeil: string;
  planningTouch: string;
  planningSideArrival: string;
  planningEmpty: string;
  planningMailSubject: string;
  planningMailHello: string;
  planningMailIntro: string;
  planningDismantle: string;
  premiumLocation: string;
  premiumMailSubject: string;
  premiumMailIntro: string;
  premiumMailTimesTitle: string;
  premiumMailTimes: string;
  premiumMailImportant: string;
  premiumMailImportantBody: string;
  activationReminderSubject: string;
  activationReminderHello: string;
  activationReminderGreeting: string;
  activationReminderBody: string;
  activationReminderCta: string;
  activationReminderWeekSubject: string;
  activationReminderWeekBody: string;
  activationReminderWeekCta: string;
  activationReminderWeekClose: string;
  activationReminderUrgentSubject: string;
  activationReminderUrgentBody: string;
  activationReminderUrgentCta: string;
  activationReminderUrgentClose: string;
  activationReminderUrgentLink: string;
  activationReminderLink: string;
  activationReminderClose: string;
  activationReminderSignoff: string;
  inviteMailSubject: string;
  inviteMailBody: string;
  inviteMailCta: string;
  inviteMailLink: string;
  inviteMailExpiry: string;
  mailHi: string;
  appointmentReminderSubject: string;
  appointmentReminderHello: string;
  appointmentReminderIntro: string;
  appointmentReminderDetails: string;
  appointmentReminderSoonSubject: string;
  appointmentReminderSoonIntro: string;
  appointmentReminderSoonDetails: string;
  appointmentReminderSoonClose: string;
  appointmentReminderSoonSignoff: string;
  appointmentReminderConfirm: string;
  appointmentReminderClose: string;
  appointmentAmountDue: string;
  appointmentHour: string;
  mailService: string;
  mailDate: string;
  mailTime: string;
  mailPlace: string;
  mailAmount: string;
  unsubRemindersFooter: string;
  unsubCommercialFooter: string;
  unsubTitle: string;
  unsubRemindersLead: string;
  unsubCommercialLead: string;
  unsubButton: string;
  unsubDone: string;
  unsubBad: string;
  confirmCitaTitle: string;
  confirmCitaLead: string;
  confirmCitaButton: string;
  confirmCitaDone: string;
  confirmCitaBad: string;
  companionsTitle: string;
  companionOne: string;
  companionsLead: string;
  companionsTrials: string;
  billingTitle: string;
  billingLead: string;
  docsTitle: string;
  docsLead: string;
  docsEmpty: string;
  sendDocument: string;
  sendDocumentHint: string;
  sendDocumentFile: string;
  download: string;
  agendaTitle: string;
  agendaLead: string;
  historyTitle: string;
  eventData: string;
  inspirationsTab: string;
  makeupTab: string;
  hairTab: string;
  photosTab: string;
  personName: string;
  addCompanion: string;
  lookNotes: string;
  productsTab: string;
  notesTab: string;
  commentsTab: string;
  moreInfo: string;
  commsHistory: string;
  commsWrite: string;
  commsWait: string;
  historyLead: string;
  contactsTitle: string;
  historyEmpty: string;
  budgetTitle: string;
  budgetLead: string;
  budgetTotal: string;
  budgetPaid: string;
  budgetPending: string;
  budgetUnset: string;
  budgetEmpty: string;
  budgetEvent: string;
  budgetCare: string;
  budgetCareEmpty: string;
  budgetService: string;
  budgetPerson: string;
  budgetEveryone: string;
  budgetFilterEmpty: string;
  requestLabel: string;
  filterShow: string;
  filterAll: string;
  filterServices: string;
  filterContacts: string;
  filterRequests: string;
  filterService: string;
  filterPay: string;
  filterWho: string;
  filterHer: string;
  filterGuest: string;
  filterContact: string;
  filterEmpty: string;
  historyKinds: { contacto: string; servicio: string };
  historyTitles: Record<string, string>;
  yourName: string;
  lastName: string;
  partnerName: string;
  phone: string;
  eventType: string;
  eventTypes: { boda: string; evento: string; otro: string };
  date: string;
  venue: string;
  gettingReadyPlace: string;
  serviceStreet: string;
  servicePostal: string;
  serviceCity: string;
  serviceProvince: string;
  serviceSave: string;
  confirmTitle: string;
  confirmModify: string;
  confirmKeep: string;
  commercialConsent: string;
  yes: string;
  no: string;
  gettingReadyTime: string;
  ceremonyTime: string;
  assignedStylist: string;
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
  productZones: Record<string, string>;
  trialPhotos: string;
  trialPhotosEmpty: string;
  remove: string;
  removeConfirm: string;
  removePhoto: string;
  agendaEmpty: string;
  agendaFilter: string;
  agendaFilterAll: string;
  agendaFilterConfirmed: string;
  agendaFilterPending: string;
  agendaFilterCancelled: string;
  agendaFilterEmpty: string;
  agendaBook: string;
  agendaBookLead: string;
  agendaCalendar: string;
  agendaHistory: string;
  agendaUpdated: string;
  agendaOptions: string;
  agendaModify: string;
  agendaCancel: string;
  agendaCancelLead: string;
  agendaSave: string;
  agendaTime: string;
  agendaPlace: string;
  agendaNotes: string;
  photoOpen: string;
  photoClose: string;
  agendaFree: string;
  agendaClose: string;
  agendaPrev: string;
  agendaNext: string;
  mailLabel: string;
  threadClient: string;
  threadStudio: string;
  threadAuthor: string;
  threadReply: string;
  replyButton: string;
  replyPlaceholder: string;
  replySent: string;
  replyError: string;
  noDate: string;
  appointment: string;
  appointmentTitles: Record<string, string>;
  statuses: {
    planificada: string;
    confirmada: string;
    hecha: string;
    anulada: string;
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
  searchName: string;
  searchNameEmpty: string;
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
  menu: "Menú",
  logout: "Salir",
  hello: "Hola, {name}.",
  panelLead: "Toda la información, gestión y planificación de tu evento al alcance de tu mano.",
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
    contratante: "Tu evento",
    acompanantes: "Acompañantes",
    documentacion: "Documentación",
    agenda: "Agenda",
    historico: "Comunicaciones",
    budget: "Budget",
  },
  yourDetails: "Tus datos",
  yourDetailsLead: "Cuanto más concreto, más fácil organizo horarios y equipo.",
  saveCard: "Guardar ficha",
  trialHeading: "Prueba",
  trialLead: "Aquí verás las fotos que haga el día de la prueba y los productos que hayamos usado.",
  planningTab: "Planning",
  planningDownload: "Descargar planning",
  planningLocation: "Localización",
  planningAddress: "Dirección",
  planningArrival: "Hora de llegada",
  planningArrivalShort: "Llegada",
  planningAt: "a las {time}",
  planningFromTo: "de {start} a {end}",
  planningRange: "{start} – {end}",
  planningPending: "Pendiente de pago del servicio: {amount}",
  planningCashNote:
    "Si vas a abonar este importe en metálico y necesitas cambio, avísame con un par de días de antelación.",
  planningSet: "Preparación del set",
  planningSchedule: "Horario",
  planningBreaks: "Descanso",
  planningPack: "Fin de servicio",
  planningNotes: "Notas",
  planningExtra: "Extra",
  planningVeil: "Colocación de velo",
  planningTouch: "Retoque post ceremonia",
  planningSideArrival: "Llegada y montaje",
  planningEmpty: "Todavía no hay planning del día.",
  planningMailSubject: "Planning de tu evento",
  planningMailHello: "Hola {name},",
  planningMailIntro: "Te dejo el planning del día del evento.",
  planningDismantle: "Desmontaje",
  premiumLocation: "Ubicación",
  premiumMailSubject: "Tu planning de {service} e información importante para tu evento",
  premiumMailIntro:
    "Ya tienes disponible tu planning en tu área de cliente para que consultes todos los detalles del servicio.",
  premiumMailTimesTitle: "Información sobre los tiempos de inicio:",
  premiumMailTimes:
    "Cuento con un margen de cortesía de ±20 minutos al inicio de la hora acordada. Ese margen se ajustará de forma proporcional a la hora de finalización para asegurar el tiempo total contratado.",
  premiumMailImportant: "Punto muy importante:",
  premiumMailImportantBody:
    "Si transcurren esos 20 minutos de margen y aún no es posible comenzar el servicio, el tiempo contratado empezará a contabilizarse. Por eso, te recomiendo coordinar muy bien este horario con la finca, espacio o restaurante para evitar retrasos y costes adicionales de horas extra.",
  activationReminderSubject: "Tu área de cliente te está esperando",
  activationReminderHello: "Hola {name},",
  activationReminderGreeting: "Hola, {name}:",
  activationReminderBody:
    "Veo que aún no has completado la activación de tu área de cliente. Quiero asegurarme de que tengas acceso a todas tus ventajas y gestiones de forma rápida y sencilla.",
  activationReminderCta: "Para activarla, solo debes hacer clic en el siguiente enlace y elegir tu contraseña:",
  activationReminderWeekSubject: "{name}, tu área de cliente te está esperando",
  activationReminderWeekBody:
    "Te escribo porque he visto que han pasado unos días y tu área de cliente todavía sigue sin activar.",
  activationReminderWeekCta:
    "Quiero asegurarme de que puedas entrar sin problemas y tenerlo todo a mano. Solo te llevará un minuto: haz clic en el enlace y elige tu contraseña.",
  activationReminderWeekClose: "(Si ya la has activado en estas últimas horas, por favor ignora este mensaje).",
  activationReminderUrgentSubject: "{name}, Tu área sigue pendiente de activación (caduca pronto)",
  activationReminderUrgentBody:
    "Te escribo para recordarte que tu área de cliente aún no está activa. Me gustaría que pudieras entrar para revisar todo tu espacio con tranquilidad.",
  activationReminderUrgentCta:
    "Ten en cuenta que el enlace caducará el {date}. Puedes completarlo ahora mismo en solo un minuto:",
  activationReminderUrgentClose: "(Si ya realizaste este paso recientemente, no te preocupes, ignora este mensaje).",
  activationReminderUrgentLink: "Activar mi área ahora",
  activationReminderLink: "Activar mi área de cliente",
  activationReminderClose: "(Si ya has completado este paso recientemente, por favor ignora este mensaje).",
  activationReminderSignoff: "Un saludo,",
  inviteMailSubject: "¡Ya está lista tu área de cliente, {name}!",
  inviteMailBody:
    "Te confirmo que tu área de cliente ya está completamente lista. A través de ella podrás consultar tu ficha, revisar tus fotos y ver todos los detalles de tu servicio.",
  inviteMailCta: "Para acceder por primera vez, solo haz clic en el siguiente enlace y crea tu contraseña:",
  inviteMailLink: "Activar mi área y ver fotos",
  inviteMailExpiry: "Nota: Por seguridad, este enlace es de uso único y caducará en 21 días.",
  mailHi: "¡Hola, {name}!",
  appointmentReminderSubject: "¡Falta una semana para nuestra cita, {name}!",
  appointmentReminderHello: "¡Hola, {name}!",
  appointmentReminderIntro:
    "Te escribo para recordarte que queda justo una semana para nuestra sesión. Para poder organizarme y tenerlo todo a punto, por favor confírmame que la fecha te sigue viniendo bien.",
  appointmentReminderDetails: "Detalles de tu cita:",
  appointmentReminderSoonSubject: "Recordatorio: Recordatorio de cita",
  appointmentReminderSoonIntro:
    "Te escribo para recordarte que falta muy poco para nuestra sesión. Por favor, ayúdame confirmando tu asistencia para mantenerlo todo preparado.",
  appointmentReminderSoonDetails: "Detalles de tu reserva:",
  appointmentReminderSoonClose:
    "(Si necesitas reprogramar o cancelar, simplemente responde a este correo y lo gestiono).",
  appointmentReminderSoonSignoff: "¡Un abrazo!",
  appointmentReminderConfirm: "Confirmar mi cita",
  appointmentReminderClose: "(Si necesitas cambiar el día o la hora, simplemente responde a este correo y lo vemos).",
  appointmentAmountDue: "Importe pendiente",
  appointmentHour: "{time} h",
  mailService: "Servicio",
  mailDate: "Fecha",
  mailTime: "Hora",
  mailPlace: "Ubicación",
  mailAmount: "Importe",
  unsubRemindersFooter: "Darme de baja de estos recordatorios",
  unsubCommercialFooter: "Darme de baja de la información comercial",
  unsubTitle: "Avisos",
  unsubRemindersLead: "Dejas de recibir recordatorios de activación y de citas.",
  unsubCommercialLead: "Dejas de recibir información comercial.",
  unsubButton: "Darme de baja",
  unsubDone: "Listo. No te enviaremos más este tipo de correos.",
  unsubBad: "Este enlace no sirve.",
  confirmCitaTitle: "Confirmar cita",
  confirmCitaLead: "Confirma que vienes a esta cita.",
  confirmCitaButton: "Confirmar",
  confirmCitaDone: "Cita confirmada. Te espero.",
  confirmCitaBad: "Este enlace no sirve.",
  companionsTitle: "Acompañantes",
  companionOne: "Acompañante",
  companionsLead:
    "El número de personas abre una ficha por cada una. Alergias y notas van siempre; las notas de la prueba, sólo si la marcan.",
  companionsTrials: "Pruebas de acompañantes",
  billingTitle: "Facturación y pagos",
  billingLead:
    "Reserva, prueba y día del evento. Yo anoto los importes y si están abonados; aquí ves lo pendiente.",
  docsTitle: "Presupuestos, contratos y papeles",
  docsLead: "Aquí cuelgo presupuestos, contratos y el resto de documentación.",
  docsEmpty: "Aún no hay documentos. Cuando haya presupuesto o contrato, aparecerá aquí.",
  sendDocument: "Enviar documentación",
  sendDocumentHint: "PDF o imagen. Lo veré aquí, en tu documentación.",
  sendDocumentFile: "Archivo",
  download: "Descargar",
  agendaTitle: "Agenda",
  agendaLead: "Las citas que tenemos planificadas: prueba, evento y lo que vayamos sumando.",
  historyTitle: "Comunicaciones",
  eventData: "Datos del evento",
  inspirationsTab: "Inspiraciones",
  makeupTab: "Maquillaje",
  hairTab: "Peinado",
  photosTab: "Fotografías",
  personName: "Nombre",
  addCompanion: "Añadir acompañante",
  lookNotes: "Notas para clonar el look",
  productsTab: "Productos",
  notesTab: "Notas / comentarios",
  commentsTab: "Comentarios",
  moreInfo: "Información",
  commsHistory: "Histórico",
  commsWrite: "Nueva comunicación",
  commsWait: "Cuando la ficha esté guardada, puedes escribirme desde aquí.",
  historyLead: "Aquí encontrarás un extracto de tus solicitudes o cambios.",
  contactsTitle: "Contactos y solicitudes",
  historyEmpty: "Todavía no hay contactos ni solicitudes.",
  budgetTitle: "Budget",
  budgetLead: "Ten controlados los pagos y conoce el detalle de todos los servicios realizados.",
  budgetTotal: "Total",
  budgetPaid: "Abonado",
  budgetPending: "Pendiente",
  budgetUnset: "Importe por anotar",
  budgetEmpty: "Todavía no hay servicios ni importes en el budget.",
  budgetEvent: "Evento",
  budgetCare: "Otros",
  budgetCareEmpty: "Todavía no hay otros gastos.",
  budgetService: "Tu servicio",
  budgetPerson: "Persona",
  budgetEveryone: "Todas",
  budgetFilterEmpty: "No hay importes en este apartado.",
  requestLabel: "Solicitud",
  filterShow: "Ver",
  filterAll: "Todo",
  filterServices: "Servicios",
  filterContacts: "Contactos",
  filterRequests: "Solicitudes",
  filterService: "Tipo de servicio",
  filterPay: "Pago",
  filterWho: "Para",
  filterHer: "Ella",
  filterGuest: "Acompañante",
  filterContact: "Tipo de gestión",
  filterEmpty: "Nada coincide con estos filtros.",
  historyKinds: { contacto: "Contacto", servicio: "Servicio" },
  historyTitles: {
    Llamada: "Llamada",
    WhatsApp: "WhatsApp",
    Reunión: "Reunión",
    Correo: "Correo",
    Otro: "Otro",
    "Maquillaje y peinado": "Maquillaje y peinado",
    Maquillaje: "Maquillaje",
    Peinado: "Peinado",
    Prueba: "Prueba",
    "Tratamiento facial": "Tratamiento facial",
    "Servicios de ojos": "Servicios de ojos",
    "Bonos de tratamientos": "Bonos de tratamientos",
    "Bonos de ojos": "Bonos de ojos",
    Formaciones: "Formaciones",
    "Compra de productos": "Compra de productos",
    "Maquillaje y Peinado": "Maquillaje y Peinado",
    "Sólo Maquillaje": "Sólo Maquillaje",
    "Sólo peinado": "Sólo peinado",
    "Bonos de tratamientos faciales": "Bonos de tratamientos faciales",
    "Bonos servicios de ojos": "Bonos servicios de ojos",
    "Glitter Bar": "Glitter Bar",
    "Beauty Corner": "Beauty Corner",
    otro: "otro",
    "Tratamiento de piel": "Tratamiento facial",
  },
  yourName: "Nombre",
  lastName: "Apellidos",
  partnerName: "Nombre de tu pareja",
  phone: "Teléfono",
  eventType: "Tipo de evento",
  eventTypes: { boda: "Boda", evento: "Evento", otro: "Otro" },
  date: "Fecha",
  venue: "Lugar de la celebración",
  gettingReadyPlace: "Dirección donde realizar el servicio",
  serviceStreet: "Calle",
  servicePostal: "Código postal",
  serviceCity: "Población",
  serviceProvince: "Provincia",
  serviceSave: "Guardar dirección",
  confirmTitle: "Revisa los datos antes de guardar",
  confirmModify: "Modificar",
  confirmKeep: "Guardar ficha",
  commercialConsent:
    "Autorizo que me enviéis información comercial. Son muy pocos envíos y puedo darme de baja en cualquier momento.",
  yes: "Sí",
  no: "No",
  gettingReadyTime: "Hora de prepararos",
  ceremonyTime: "Hora de ceremonia o inicio",
  assignedStylist: "Estilista asignado",
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
  who: "Parentesco",
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
  contractor: "Tu evento",
  guestN: "Acompañante {n}",
  deposit: "Reserva",
  trialDay: "Día de la prueba",
  eventDay: "Día del evento",
  paid: "Abonado",
  unpaid: "Pendiente de pagar",
  pending: "Pendiente de pagar: {amount}",
  productsUsed: "Productos utilizados",
  productsEmpty: "Aún no hay productos anotados.",
  productZones: {
    Ojos: "Ojos",
    Labios: "Labios",
    Piel: "Piel",
    Acabado: "Acabado",
    Cejas: "Cejas",
    Pestañas: "Pestañas",
    Mejillas: "Mejillas",
    Previo: "Previo",
    Preparación: "Preparación",
    Materiales: "Materiales",
    Decoración: "Decoración",
    Extensiones: "Extensiones",
    Rellenos: "Rellenos",
    Otros: "Otros",
  },
  trialPhotos: "Fotos de la prueba",
  trialPhotosEmpty: "Todavía no hay fotos de la prueba.",
  remove: "Quitar",
  removeConfirm: "¿Quitar este archivo?",
  removePhoto: "Quitar foto",
  agendaEmpty: "Todavía no hay citas en la agenda.",
  agendaFilter: "Ver",
  agendaFilterAll: "Todas",
  agendaFilterConfirmed: "Confirmadas",
  agendaFilterPending: "Pendientes de confirmar",
  agendaFilterCancelled: "Anuladas",
  agendaFilterEmpty: "No hay citas en este grupo.",
  agendaBook: "Pide una cita",
  agendaCalendar: "Calendario",
  agendaHistory: "Histórico de citas",
  agendaUpdated: "Cita actualizada.",
  agendaOptions: "Opciones de la cita",
  agendaModify: "Modificar",
  agendaCancel: "Anular",
  agendaCancelLead: "Esta cita quedará anulada.",
  agendaSave: "Guardar cambios",
  agendaTime: "Hora",
  agendaPlace: "Lugar",
  agendaNotes: "Notas",
  agendaBookLead:
    "Las casillas que estén marcadas tienen huecos disponibles. Selecciona el que mejor se adapte a tu agenda. Recuerda que hasta que no recibas mi confirmación de cita, esta no está bloqueada.",
  photoOpen: "Ver fotos",
  photoClose: "Cerrar",
  agendaFree: "Citas disponibles",
  agendaClose: "Cerrar",
  agendaPrev: "Anterior",
  agendaNext: "Siguiente",
  mailLabel: "Correo",
  threadClient: "Clienta",
  threadStudio: "Estudio",
  threadAuthor: "Ana Zarza",
  threadReply: "Respuesta",
  replyButton: "Responder",
  replyPlaceholder: "Escribe tu respuesta",
  replySent: "Respuesta enviada.",
  replyError: "Escribe la respuesta antes de enviarla.",
  noDate: "Sin fecha",
  appointment: "Cita",
  appointmentTitles: {
    "Tratamiento facial": "Tratamiento facial",
    Maquillaje: "Maquillaje",
    Peinado: "Peinado",
    "Maquillaje y peinado": "Maquillaje y peinado",
    Curso: "Curso",
    Entrevista: "Entrevista",
    Prueba: "Prueba",
    "Tratamientos de ojos": "Tratamientos de ojos",
    Evento: "Evento",
    Reserva: "Reserva",
    Otra: "Otra",
  },
  statuses: {
    planificada: "Planificada",
    confirmada: "Confirmada",
    hecha: "Hecha",
    anulada: "Anulada",
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
    "Esta ficha ya está guardada y no se puede editar. Si algo cambia, escríbeme en Comunicaciones.",
  notifyChanges: "Notificar cambios",
  searchName: "Buscar por nombre",
  searchNameEmpty: "Ningún nombre coincide.",
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
  menu: "Menu",
  logout: "Log out",
  hello: "Hello, {name}.",
  panelLead: "All the information, management and planning for your event, right at hand.",
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
    contratante: "Your event",
    acompanantes: "Guests",
    documentacion: "Documents",
    agenda: "Diary",
    historico: "Communications",
    budget: "Budget",
  },
  yourDetails: "Your details",
  yourDetailsLead: "The more specific you are, the easier it is to plan timing and team.",
  saveCard: "Save details",
  trialHeading: "Trial",
  trialLead: "Here you will see the photos from the trial and the products we used.",
  planningTab: "Planning",
  planningDownload: "Download planning",
  planningLocation: "Location",
  planningAddress: "Address",
  planningArrival: "Arrival time",
  planningArrivalShort: "Arrival",
  planningAt: "at {time}",
  planningFromTo: "from {start} to {end}",
  planningRange: "{start} – {end}",
  planningPending: "Outstanding for the service: {amount}",
  planningCashNote: "If you will pay this in cash and need change, tell me a couple of days ahead.",
  planningSet: "Set preparation",
  planningSchedule: "Schedule",
  planningBreaks: "Break",
  planningPack: "End of service",
  planningNotes: "Notes",
  planningExtra: "Extra",
  planningVeil: "Veil placement",
  planningTouch: "Touch-up after the ceremony",
  planningSideArrival: "Arrival and setup",
  planningEmpty: "The event-day plan is not ready yet.",
  planningMailSubject: "Your event plan",
  planningMailHello: "Hello {name},",
  planningMailIntro: "Here is the plan for the day of the event.",
  planningDismantle: "Pack-up",
  premiumLocation: "Location",
  premiumMailSubject: "Your {service} plan and important information for your event",
  premiumMailIntro: "Your plan is now in your client area, so you can check every detail of the service.",
  premiumMailTimesTitle: "About the start times:",
  premiumMailTimes:
    "I allow a courtesy window of ±20 minutes from the agreed start. That window is adjusted in proportion to the finish time, so the total time you booked stays intact.",
  premiumMailImportant: "Very important:",
  premiumMailImportantBody:
    "If those 20 minutes pass and the service still cannot start, the booked time begins to count. Please coordinate this schedule carefully with the venue, space or restaurant, so delays and extra-hour charges are avoided.",
  activationReminderSubject: "Your client area is waiting for you",
  activationReminderHello: "Hello {name},",
  activationReminderGreeting: "Hello, {name}:",
  activationReminderBody:
    "I see you have not finished activating your client area yet. I want to make sure you can reach everything that is yours, and manage it quickly and easily.",
  activationReminderCta: "To activate it, just click the link below and choose your password:",
  activationReminderWeekSubject: "{name}, your client area is waiting for you",
  activationReminderWeekBody:
    "I am writing because a few days have passed and your client area is still not active.",
  activationReminderWeekCta:
    "I want to make sure you can get in without trouble and have everything to hand. It only takes a minute: click the link and choose your password.",
  activationReminderWeekClose: "(If you have activated it in the last few hours, please ignore this message).",
  activationReminderUrgentSubject: "{name}, your client area is still waiting to be activated (it expires soon)",
  activationReminderUrgentBody:
    "I am writing to remind you that your client area is not active yet. I would like you to be able to look through your space in your own time.",
  activationReminderUrgentCta: "Please note that the link will expire on {date}. You can finish it right now, in just a minute:",
  activationReminderUrgentClose: "(If you have already done this recently, do not worry, ignore this message).",
  activationReminderUrgentLink: "Activate my area now",
  activationReminderLink: "Activate my client area",
  activationReminderClose: "(If you have already completed this step recently, please ignore this message).",
  activationReminderSignoff: "Kind regards,",
  inviteMailSubject: "Your client area is ready, {name}!",
  inviteMailBody:
    "Your client area is completely ready. From there you can look at your file, review your photos and see every detail of your service.",
  inviteMailCta: "To sign in for the first time, just click the link below and create your password:",
  inviteMailLink: "Activate my area and see the photos",
  inviteMailExpiry: "Note: for security, this link works only once and will expire in 21 days.",
  mailHi: "Hello, {name}!",
  appointmentReminderSubject: "Our appointment is one week away, {name}!",
  appointmentReminderHello: "Hello, {name}!",
  appointmentReminderIntro:
    "I am writing to remind you that our session is exactly one week away. So I can get everything ready, please confirm that the date still suits you.",
  appointmentReminderDetails: "Your appointment:",
  appointmentReminderSoonSubject: "Reminder: appointment reminder",
  appointmentReminderSoonIntro:
    "I am writing to remind you that our session is very soon. Please confirm that you are coming, so I can have everything ready.",
  appointmentReminderSoonDetails: "Your booking:",
  appointmentReminderSoonClose: "(If you need to reschedule or cancel, just reply to this email and I will take care of it).",
  appointmentReminderSoonSignoff: "A hug!",
  appointmentReminderConfirm: "Confirm my appointment",
  appointmentReminderClose: "(If you need to change the day or the time, just reply to this email and we will sort it out).",
  appointmentAmountDue: "Amount outstanding",
  appointmentHour: "{time}",
  mailService: "Service",
  mailDate: "Date",
  mailTime: "Time",
  mailPlace: "Location",
  mailAmount: "Amount",
  unsubRemindersFooter: "Unsubscribe from these reminders",
  unsubCommercialFooter: "Unsubscribe from news and offers",
  unsubTitle: "Messages",
  unsubRemindersLead: "You will stop receiving activation and appointment reminders.",
  unsubCommercialLead: "You will stop receiving news and offers.",
  unsubButton: "Unsubscribe",
  unsubDone: "Done. We will not send you this kind of email again.",
  unsubBad: "This link does not work.",
  confirmCitaTitle: "Confirm appointment",
  confirmCitaLead: "Confirm that you are coming to this appointment.",
  confirmCitaButton: "Confirm",
  confirmCitaDone: "Appointment confirmed. I will see you there.",
  confirmCitaBad: "This link does not work.",
  companionsTitle: "Guests",
  companionOne: "Guest",
  companionsLead:
    "The number of people opens a card for each one. Allergies and notes are always there; trial notes only if they want a trial.",
  companionsTrials: "Guest trials",
  billingTitle: "Billing and payments",
  billingLead: "Deposit, trial and event day. I enter the amounts and whether they are paid; here you see what is outstanding.",
  docsTitle: "Quotes, contracts and papers",
  docsLead: "I upload quotes, contracts and the rest of the paperwork here.",
  docsEmpty: "No documents yet. When there is a quote or contract, it will appear here.",
  sendDocument: "Send a document",
  sendDocumentHint: "PDF or image. I will see it here, in your documents.",
  sendDocumentFile: "File",
  download: "Download",
  agendaTitle: "Diary",
  agendaLead: "The appointments we have planned: trial, event, and anything we add.",
  historyTitle: "Communications",
  eventData: "Event details",
  inspirationsTab: "Inspiration",
  makeupTab: "Makeup",
  hairTab: "Hair",
  photosTab: "Photographs",
  personName: "Name",
  addCompanion: "Add a guest",
  lookNotes: "Notes to recreate the look",
  productsTab: "Products",
  notesTab: "Notes / comments",
  commentsTab: "Comments",
  moreInfo: "Information",
  commsHistory: "History",
  commsWrite: "New message",
  commsWait: "Once the details are saved, you can write to me from here.",
  historyLead: "Here you will find a summary of your requests and changes.",
  contactsTitle: "Contacts and requests",
  historyEmpty: "There are no contacts or requests yet.",
  budgetTitle: "Budget",
  budgetLead: "Keep your payments in view and see every service that has been carried out.",
  budgetTotal: "Total",
  budgetPaid: "Paid",
  budgetPending: "Outstanding",
  budgetUnset: "Amount still to enter",
  budgetEmpty: "There are no services or amounts in the budget yet.",
  budgetEvent: "Event",
  budgetCare: "Other",
  budgetCareEmpty: "No other expenses yet.",
  budgetService: "Your service",
  budgetPerson: "Person",
  budgetEveryone: "Everyone",
  budgetFilterEmpty: "There are no amounts in this view.",
  requestLabel: "Request",
  filterShow: "Show",
  filterAll: "All",
  filterServices: "Services",
  filterContacts: "Contacts",
  filterRequests: "Requests",
  filterService: "Service type",
  filterPay: "Payment",
  filterWho: "For",
  filterHer: "Her",
  filterGuest: "Guest",
  filterContact: "Kind of contact",
  filterEmpty: "Nothing matches these filters.",
  historyKinds: { contacto: "Contact", servicio: "Service" },
  historyTitles: {
    Llamada: "Call",
    WhatsApp: "WhatsApp",
    Reunión: "Meeting",
    Correo: "Email",
    Otro: "Other",
    "Maquillaje y peinado": "Makeup and hair",
    Maquillaje: "Makeup",
    Peinado: "Hair",
    Prueba: "Trial",
    "Tratamiento facial": "Facial treatment",
    "Servicios de ojos": "Eye services",
    "Bonos de tratamientos": "Treatment packages",
    "Bonos de ojos": "Eye packages",
    Formaciones: "Training",
    "Compra de productos": "Product purchase",
    "Maquillaje y Peinado": "Makeup and hair",
    "Sólo Maquillaje": "Makeup only",
    "Sólo peinado": "Hair only",
    "Bonos de tratamientos faciales": "Facial treatment packages",
    "Bonos servicios de ojos": "Eye service packages",
    "Glitter Bar": "Glitter Bar",
    "Beauty Corner": "Beauty Corner",
    otro: "Other",
    "Tratamiento de piel": "Skin treatment",
  },
  yourName: "First name",
  lastName: "Last name",
  partnerName: "Your partner’s name",
  phone: "Phone",
  eventType: "Type of event",
  eventTypes: { boda: "Wedding", evento: "Event", otro: "Other" },
  date: "Date",
  venue: "Venue",
  gettingReadyPlace: "Address where the service takes place",
  serviceStreet: "Street",
  servicePostal: "Postcode",
  serviceCity: "Town",
  serviceProvince: "Province",
  serviceSave: "Save address",
  confirmTitle: "Check the details before saving",
  confirmModify: "Edit",
  confirmKeep: "Save details",
  commercialConsent:
    "I agree to receive commercial messages. There are very few, and I can unsubscribe at any time.",
  yes: "Yes",
  no: "No",
  gettingReadyTime: "Getting-ready time",
  ceremonyTime: "Ceremony or start time",
  assignedStylist: "Assigned stylist",
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
  who: "Relationship",
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
  contractor: "Your event",
  guestN: "Guest {n}",
  deposit: "Deposit",
  trialDay: "Trial day",
  eventDay: "Event day",
  paid: "Paid",
  unpaid: "Outstanding",
  pending: "Outstanding: {amount}",
  productsUsed: "Products used",
  productsEmpty: "No products noted yet.",
  productZones: {
    Ojos: "Eyes",
    Labios: "Lips",
    Piel: "Skin",
    Acabado: "Finish",
    Cejas: "Brows",
    Pestañas: "Lashes",
    Mejillas: "Cheeks",
    Previo: "Prep",
    Preparación: "Preparation",
    Materiales: "Materials",
    Decoración: "Decoration",
    Extensiones: "Extensions",
    Rellenos: "Padding",
    Otros: "Other",
  },
  trialPhotos: "Trial photos",
  trialPhotosEmpty: "No trial photos yet.",
  remove: "Remove",
  removeConfirm: "Remove this file?",
  removePhoto: "Remove photo",
  agendaEmpty: "There are no appointments in the diary yet.",
  agendaFilter: "Show",
  agendaFilterAll: "All",
  agendaFilterConfirmed: "Confirmed",
  agendaFilterPending: "Pending confirmation",
  agendaFilterCancelled: "Cancelled",
  agendaFilterEmpty: "There are no appointments in this group.",
  agendaBook: "Book an appointment",
  agendaCalendar: "Calendar",
  agendaHistory: "Appointment history",
  agendaUpdated: "Appointment updated.",
  agendaOptions: "Appointment options",
  agendaModify: "Edit",
  agendaCancel: "Cancel",
  agendaCancelLead: "This appointment will be cancelled.",
  agendaSave: "Save changes",
  agendaTime: "Time",
  agendaPlace: "Place",
  agendaNotes: "Notes",
  agendaBookLead:
    "Marked days have openings. Choose the one that fits your diary. Until you receive my confirmation, the appointment is not held.",
  photoOpen: "View photos",
  photoClose: "Close",
  agendaFree: "Appointments available",
  agendaClose: "Close",
  agendaPrev: "Previous",
  agendaNext: "Next",
  mailLabel: "Email",
  threadClient: "Client",
  threadStudio: "Studio",
  threadAuthor: "Ana Zarza",
  threadReply: "Reply",
  replyButton: "Reply",
  replyPlaceholder: "Write your reply",
  replySent: "Reply sent.",
  replyError: "Write the reply before sending it.",
  noDate: "No date",
  appointment: "Appointment",
  appointmentTitles: {
    "Tratamiento facial": "Facial treatment",
    Maquillaje: "Makeup",
    Peinado: "Hair",
    "Maquillaje y peinado": "Makeup and hair",
    Curso: "Course",
    Entrevista: "Interview",
    Prueba: "Trial",
    "Tratamientos de ojos": "Eye treatments",
    Evento: "Event",
    Reserva: "Deposit",
    Otra: "Other",
  },
  statuses: {
    planificada: "Planned",
    confirmada: "Confirmed",
    hecha: "Done",
    anulada: "Cancelled",
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
    "This form is saved and can no longer be edited. If something changes, write to me in Communications.",
  notifyChanges: "Request a change",
  searchName: "Search by name",
  searchNameEmpty: "No name matches.",
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
  menu: "Menu",
  logout: "Sortir",
  hello: "Bonjour, {name}.",
  panelLead: "Toute l’information, la gestion et la planification de ton événement à portée de main.",
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
    contratante: "Ton événement",
    acompanantes: "Accompagnants",
    documentacion: "Documents",
    agenda: "Agenda",
    historico: "Communications",
    budget: "Budget",
  },
  yourDetails: "Tes informations",
  yourDetailsLead: "Plus c’est précis, plus j’organise facilement les horaires et l’équipe.",
  saveCard: "Enregistrer la fiche",
  trialHeading: "Essai",
  trialLead: "Tu verras ici les photos du jour de l’essai et les produits utilisés.",
  planningTab: "Planning",
  planningDownload: "Télécharger le planning",
  planningLocation: "Lieu",
  planningAddress: "Adresse",
  planningArrival: "Heure d’arrivée",
  planningArrivalShort: "Arrivée",
  planningAt: "à {time}",
  planningFromTo: "de {start} à {end}",
  planningRange: "{start} – {end}",
  planningPending: "Reste à payer pour la prestation : {amount}",
  planningCashNote: "Si tu règles ce montant en espèces et qu’il te faut de la monnaie, préviens-moi quelques jours avant.",
  planningSet: "Préparation du set",
  planningSchedule: "Horaires",
  planningBreaks: "Pause",
  planningPack: "Fin du service",
  planningNotes: "Notes",
  planningExtra: "Extra",
  planningVeil: "Pose du voile",
  planningTouch: "Retouche après la cérémonie",
  planningSideArrival: "Arrivée et installation",
  planningEmpty: "Le planning du jour n’est pas encore prêt.",
  planningMailSubject: "Le planning de ton événement",
  planningMailHello: "Bonjour {name},",
  planningMailIntro: "Voici le planning du jour de l’événement.",
  planningDismantle: "Démontage",
  premiumLocation: "Lieu",
  premiumMailSubject: "Ton planning {service} et des informations importantes pour ton événement",
  premiumMailIntro: "Ton planning est disponible dans ton espace cliente, pour que tu puisses consulter tous les détails du service.",
  premiumMailTimesTitle: "À propos des horaires de début :",
  premiumMailTimes:
    "Je prévois une marge de courtoisie de ±20 minutes au début de l’heure convenue. Cette marge s’ajuste de façon proportionnelle à l’heure de fin, pour préserver le temps total réservé.",
  premiumMailImportant: "Point très important :",
  premiumMailImportantBody:
    "Si ces 20 minutes s’écoulent et que le service ne peut toujours pas commencer, le temps réservé commence à être compté. Coordonne bien cet horaire avec le domaine, l’espace ou le restaurant pour éviter les retards et les heures supplémentaires.",
  activationReminderSubject: "Ton espace cliente t’attend",
  activationReminderHello: "Bonjour {name},",
  activationReminderGreeting: "Bonjour, {name} :",
  activationReminderBody:
    "Je vois que tu n’as pas encore terminé l’activation de ton espace cliente. Je veux m’assurer que tu puisses accéder à tous tes avantages et gérer tes démarches simplement et rapidement.",
  activationReminderCta: "Pour l’activer, il te suffit de cliquer sur le lien ci-dessous et de choisir ton mot de passe :",
  activationReminderWeekSubject: "{name}, ton espace cliente t’attend",
  activationReminderWeekBody:
    "Je t’écris parce que quelques jours ont passé et ton espace cliente n’est toujours pas activé.",
  activationReminderWeekCta:
    "Je veux m’assurer que tu puisses entrer sans souci et tout avoir sous la main. Cela ne prend qu’une minute : clique sur le lien et choisis ton mot de passe.",
  activationReminderWeekClose: "(Si tu l’as activé ces dernières heures, ignore ce message).",
  activationReminderUrgentSubject: "{name}, ton espace est encore en attente d’activation (il expire bientôt)",
  activationReminderUrgentBody:
    "Je t’écris pour te rappeler que ton espace cliente n’est pas encore actif. J’aimerais que tu puisses le parcourir tranquillement.",
  activationReminderUrgentCta: "Le lien expirera le {date}. Tu peux le terminer maintenant, en une minute :",
  activationReminderUrgentClose: "(Si tu l’as déjà fait récemment, ne t’inquiète pas, ignore ce message).",
  activationReminderUrgentLink: "Activer mon espace maintenant",
  activationReminderLink: "Activer mon espace cliente",
  activationReminderClose: "(Si tu as déjà fait cette étape récemment, ignore ce message).",
  activationReminderSignoff: "Bien à toi,",
  inviteMailSubject: "Ton espace cliente est prêt, {name} !",
  inviteMailBody:
    "Ton espace cliente est complètement prêt. Tu pourras y consulter ta fiche, revoir tes photos et voir tous les détails de ta prestation.",
  inviteMailCta: "Pour y entrer la première fois, clique sur le lien ci-dessous et crée ton mot de passe :",
  inviteMailLink: "Activer mon espace et voir les photos",
  inviteMailExpiry: "Note : par sécurité, ce lien ne sert qu’une fois et expirera dans 21 jours.",
  mailHi: "Bonjour, {name} !",
  appointmentReminderSubject: "Notre rendez-vous est dans une semaine, {name} !",
  appointmentReminderHello: "Bonjour, {name} !",
  appointmentReminderIntro:
    "Je t’écris pour te rappeler que notre séance est dans exactement une semaine. Pour tout préparer, confirme-moi que la date te convient toujours.",
  appointmentReminderDetails: "Ton rendez-vous :",
  appointmentReminderSoonSubject: "Rappel : rappel de rendez-vous",
  appointmentReminderSoonIntro:
    "Je t’écris pour te rappeler que notre séance est très bientôt. Confirme-moi ta présence, pour que je puisse tout préparer.",
  appointmentReminderSoonDetails: "Ta réservation :",
  appointmentReminderSoonClose: "(S’il faut déplacer ou annuler, réponds à ce message et je m’en occupe).",
  appointmentReminderSoonSignoff: "Je t’embrasse !",
  appointmentReminderConfirm: "Confirmer mon rendez-vous",
  appointmentReminderClose: "(S’il faut changer le jour ou l’heure, réponds à ce message et on s’arrange).",
  appointmentAmountDue: "Montant restant",
  appointmentHour: "{time} h",
  mailService: "Prestation",
  mailDate: "Date",
  mailTime: "Heure",
  mailPlace: "Lieu",
  mailAmount: "Montant",
  unsubRemindersFooter: "Se désinscrire de ces rappels",
  unsubCommercialFooter: "Se désinscrire des informations commerciales",
  unsubTitle: "Messages",
  unsubRemindersLead: "Tu ne recevras plus les rappels d’activation ni de rendez-vous.",
  unsubCommercialLead: "Tu ne recevras plus d’informations commerciales.",
  unsubButton: "Se désinscrire",
  unsubDone: "C’est fait. Nous ne t’enverrons plus ce type de message.",
  unsubBad: "Ce lien ne fonctionne pas.",
  confirmCitaTitle: "Confirmer le rendez-vous",
  confirmCitaLead: "Confirme que tu viens à ce rendez-vous.",
  confirmCitaButton: "Confirmer",
  confirmCitaDone: "Rendez-vous confirmé. Je t’attends.",
  confirmCitaBad: "Ce lien ne fonctionne pas.",
  companionsTitle: "Accompagnants",
  companionOne: "Accompagnant",
  companionsLead:
    "Le nombre de personnes ouvre une fiche pour chacune. Allergies et notes sont toujours là ; les notes d’essai seulement si elles le demandent.",
  companionsTrials: "Essais des accompagnants",
  billingTitle: "Facturation et paiements",
  billingLead:
    "Acompte, essai et jour de l’événement. J’inscris les montants et s’ils sont payés ; tu vois ici le reste à régler.",
  docsTitle: "Devis, contrats et papiers",
  docsLead: "J’y dépose les devis, contrats et le reste des documents.",
  docsEmpty: "Pas encore de documents. Quand il y aura un devis ou un contrat, il apparaîtra ici.",
  sendDocument: "Envoyer un document",
  sendDocumentHint: "PDF ou image. Je le verrai ici, dans tes documents.",
  sendDocumentFile: "Fichier",
  download: "Télécharger",
  agendaTitle: "Agenda",
  agendaLead: "Les rendez-vous prévus : essai, événement, et ce que nous ajouterons.",
  historyTitle: "Communications",
  eventData: "Données de l’événement",
  inspirationsTab: "Inspirations",
  makeupTab: "Maquillage",
  hairTab: "Coiffure",
  photosTab: "Photographies",
  personName: "Nom",
  addCompanion: "Ajouter un accompagnant",
  lookNotes: "Notes pour reproduire le look",
  productsTab: "Produits",
  notesTab: "Notes / commentaires",
  commentsTab: "Commentaires",
  moreInfo: "Information",
  commsHistory: "Historique",
  commsWrite: "Nouveau message",
  commsWait: "Quand la fiche est enregistrée, tu peux m’écrire d’ici.",
  historyLead: "Tu trouveras ici un extrait de tes demandes ou changements.",
  contactsTitle: "Contacts et demandes",
  historyEmpty: "Il n’y a pas encore de contacts ni de demandes.",
  budgetTitle: "Budget",
  budgetLead: "Garde le contrôle des paiements et le détail de tous les services réalisés.",
  budgetTotal: "Total",
  budgetPaid: "Payé",
  budgetPending: "Reste",
  budgetUnset: "Montant à indiquer",
  budgetEmpty: "Il n’y a pas encore de services ni de montants dans le budget.",
  budgetEvent: "Événement",
  budgetCare: "Autres",
  budgetCareEmpty: "Pas encore d’autres dépenses.",
  budgetService: "Ton service",
  budgetPerson: "Personne",
  budgetEveryone: "Toutes",
  budgetFilterEmpty: "Il n’y a pas de montants dans cette vue.",
  requestLabel: "Demande",
  filterShow: "Voir",
  filterAll: "Tout",
  filterServices: "Services",
  filterContacts: "Contacts",
  filterRequests: "Demandes",
  filterService: "Type de service",
  filterPay: "Paiement",
  filterWho: "Pour",
  filterHer: "Elle",
  filterGuest: "Accompagnant",
  filterContact: "Type de contact",
  filterEmpty: "Rien ne correspond à ces filtres.",
  historyKinds: { contacto: "Contact", servicio: "Service" },
  historyTitles: {
    Llamada: "Appel",
    WhatsApp: "WhatsApp",
    Reunión: "Réunion",
    Correo: "E-mail",
    Otro: "Autre",
    "Maquillaje y peinado": "Maquillage et coiffure",
    Maquillaje: "Maquillage",
    Peinado: "Coiffure",
    Prueba: "Essai",
    "Tratamiento facial": "Soin du visage",
    "Servicios de ojos": "Services des yeux",
    "Bonos de tratamientos": "Forfaits de soins",
    "Bonos de ojos": "Forfaits des yeux",
    Formaciones: "Formations",
    "Compra de productos": "Achat de produits",
    "Maquillaje y Peinado": "Maquillage et coiffure",
    "Sólo Maquillaje": "Maquillage seul",
    "Sólo peinado": "Coiffure seule",
    "Bonos de tratamientos faciales": "Forfaits de soins du visage",
    "Bonos servicios de ojos": "Forfaits des services des yeux",
    "Glitter Bar": "Glitter Bar",
    "Beauty Corner": "Beauty Corner",
    otro: "Autre",
    "Tratamiento de piel": "Soin de la peau",
  },
  yourName: "Prénom",
  lastName: "Nom",
  partnerName: "Prénom de ta/ton partenaire",
  phone: "Téléphone",
  eventType: "Type d’événement",
  eventTypes: { boda: "Mariage", evento: "Événement", otro: "Autre" },
  date: "Date",
  venue: "Lieu de la célébration",
  gettingReadyPlace: "Adresse où réaliser la prestation",
  serviceStreet: "Rue",
  servicePostal: "Code postal",
  serviceCity: "Ville",
  serviceProvince: "Province",
  serviceSave: "Enregistrer l’adresse",
  confirmTitle: "Vérifie les données avant d’enregistrer",
  confirmModify: "Modifier",
  confirmKeep: "Enregistrer la fiche",
  commercialConsent:
    "J’autorise l’envoi d’informations commerciales. Il y en a très peu et je peux me désinscrire à tout moment.",
  yes: "Oui",
  no: "Non",
  gettingReadyTime: "Heure de préparation",
  ceremonyTime: "Heure de la cérémonie ou du début",
  assignedStylist: "Styliste assigné",
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
  who: "Lien",
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
  contractor: "Ton événement",
  guestN: "Accompagnant {n}",
  deposit: "Acompte",
  trialDay: "Jour de l’essai",
  eventDay: "Jour de l’événement",
  paid: "Payé",
  unpaid: "Reste à payer",
  pending: "Reste à payer : {amount}",
  productsUsed: "Produits utilisés",
  productsEmpty: "Aucun produit noté pour l’instant.",
  productZones: {
    Ojos: "Yeux",
    Labios: "Lèvres",
    Piel: "Peau",
    Acabado: "Fini",
    Cejas: "Sourcils",
    Pestañas: "Cils",
    Mejillas: "Joues",
    Previo: "Préalable",
    Preparación: "Préparation",
    Materiales: "Matériel",
    Decoración: "Décoration",
    Extensiones: "Extensions",
    Rellenos: "Remplissage",
    Otros: "Autres",
  },
  trialPhotos: "Photos de l’essai",
  trialPhotosEmpty: "Pas encore de photos de l’essai.",
  remove: "Retirer",
  removeConfirm: "Retirer ce fichier ?",
  removePhoto: "Retirer la photo",
  agendaEmpty: "Il n’y a pas encore de rendez-vous dans l’agenda.",
  agendaFilter: "Voir",
  agendaFilterAll: "Tous",
  agendaFilterConfirmed: "Confirmés",
  agendaFilterPending: "En attente de confirmation",
  agendaFilterCancelled: "Annulés",
  agendaFilterEmpty: "Il n’y a pas de rendez-vous dans ce groupe.",
  agendaBook: "Demande un rendez-vous",
  agendaCalendar: "Calendrier",
  agendaHistory: "Historique des rendez-vous",
  agendaUpdated: "Rendez-vous mis à jour.",
  agendaOptions: "Options du rendez-vous",
  agendaModify: "Modifier",
  agendaCancel: "Annuler",
  agendaCancelLead: "Ce rendez-vous sera annulé.",
  agendaSave: "Enregistrer",
  agendaTime: "Heure",
  agendaPlace: "Lieu",
  agendaNotes: "Notes",
  agendaBookLead:
    "Les cases marquées ont des créneaux. Choisis celui qui convient le mieux à ton agenda. Tant que tu n’as pas reçu ma confirmation, le rendez-vous n’est pas bloqué.",
  photoOpen: "Voir les photos",
  photoClose: "Fermer",
  agendaFree: "Rendez-vous disponibles",
  agendaClose: "Fermer",
  agendaPrev: "Précédent",
  agendaNext: "Suivant",
  mailLabel: "Courrier",
  threadClient: "Cliente",
  threadStudio: "Atelier",
  threadAuthor: "Ana Zarza",
  threadReply: "Réponse",
  replyButton: "Répondre",
  replyPlaceholder: "Écris ta réponse",
  replySent: "Réponse envoyée.",
  replyError: "Écris la réponse avant de l’envoyer.",
  noDate: "Sans date",
  appointment: "Rendez-vous",
  appointmentTitles: {
    "Tratamiento facial": "Soin du visage",
    Maquillaje: "Maquillage",
    Peinado: "Coiffure",
    "Maquillaje y peinado": "Maquillage et coiffure",
    Curso: "Cours",
    Entrevista: "Entretien",
    Prueba: "Essai",
    "Tratamientos de ojos": "Soins des yeux",
    Evento: "Événement",
    Reserva: "Acompte",
    Otra: "Autre",
  },
  statuses: {
    planificada: "Planifié",
    confirmada: "Confirmé",
    hecha: "Fait",
    anulada: "Annulé",
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
    "Cette fiche est enregistrée et ne peut plus être modifiée. Si quelque chose change, écris-moi dans Communications.",
  notifyChanges: "Signaler un changement",
  searchName: "Chercher par nom",
  searchNameEmpty: "Aucun nom ne correspond.",
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
