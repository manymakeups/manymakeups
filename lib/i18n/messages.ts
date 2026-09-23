import { defaultLocale, type Locale } from "./config";

export type ServiceCopy = {
  navTitle: string;
  kicker: string;
  title: string;
  lead: string;
  seoTitle: string;
  seoDescription: string;
  paragraphs: string[];
  points: { title: string; text: string }[];
  pullQuote?: string;
};

export type Messages = {
  meta: {
    homeTitle: string;
    homeDescription: string;
    ogTitle: string;
    notFoundTitle: string;
    notFoundHeading: string;
    notFoundBody: string;
    notFoundCta: string;
  };
  nav: {
    looks: string;
    lookbook: string;
    atelier: string;
    metodo: string;
    about: string;
    contact: string;
    principal: string;
    language: string;
  };
  common: {
    book: string;
    seeAtelier: string;
    skip: string;
    close: string;
    send: string;
    sending: string;
    whatsapp: string;
    phoneAppointment: string;
    moreLooks: string;
    moreChanges: string;
    prevPhoto: string;
    nextPhoto: string;
    prevReviews: string;
    nextReviews: string;
    legalUpdated: string;
    scrollDown: string;
    scrollUp: string;
    enlarge: string;
  };
  intro: {
    styling: string;
    training: string;
    aesthetics: string;
  };
  home: {
    kicker: string;
    heroLines: [string, string, string];
    heroCopy: string;
    looksKicker: string;
    looksTitle: string;
    atelierTitle: string;
    professionalsCard: string;
    baKicker: string;
    baTitle: string;
    baCopy: string;
    methodTitle: string;
    methodCopy: string;
    lookbookCopy: string;
    faqTitle: string;
    contactTitle: string;
    contactCopy: string;
    portraitFallback: string;
  };
  ana: {
    heading: [string, string, string];
    bio: string;
  };
  process: { n: string; title: string; text: string }[];
  faqs: { q: string; a: string }[];
  gallery: { parejas: string; peinado: string; maquillaje: string };
  contact: {
    name: string;
    email: string;
    phone: string;
    date: string;
    kind: string;
    message: string;
    kinds: string[];
    whatsappIntro: string;
    whatsappTitle: string;
    whatsappBody: string;
    errorTitle: string;
    errorBody: string;
    sentTitle: string;
    sentBody: string;
    sentActivate: string;
  };
  reviews: {
    kicker: string;
    google: string;
    roles: Record<string, string>;
  };
  footer: {
    legal: string;
    notice: string;
    privacy: string;
    cookies: string;
  };
  legal: {
    kicker: string;
    noticeTitle: string;
    noticeDescription: string;
    privacyTitle: string;
    privacyDescription: string;
    cookiesTitle: string;
    cookiesDescription: string;
    originalNote: string;
  };
  pages: {
    parejas: ServiceCopy;
    eventos: ServiceCopy;
    formacion: ServiceCopy;
    piel: ServiceCopy;
    profesionales: ServiceCopy;
  };
};

export const es: Messages = {
  meta: {
    homeTitle:
      "Maquillaje y peinado para novias y eventos en Castellón | Many Makeups",
    homeDescription:
      "Maquillaje y peinado para parejas — novias, novios y novies — y eventos en Nules y Castellón. Belleza real, de alto standing, por Ana Zarza.",
    ogTitle: "Many Makeups · Ana Zarza",
    notFoundTitle: "Página no encontrada",
    notFoundHeading: "Esta página no existe.",
    notFoundBody: "Vuelve al atelier o escribe si buscabas una fecha.",
    notFoundCta: "Ir al inicio",
  },
  nav: {
    looks: "Tendencias",
    lookbook: "Lookbook",
    atelier: "Atelier",
    metodo: "Método",
    about: "Sobre mí",
    contact: "Contacto",
    principal: "Principal",
    language: "Idioma",
  },
  common: {
    book: "Reservar cita",
    seeAtelier: "Ver el atelier",
    skip: "Saltar",
    close: "Cerrar",
    send: "Enviar",
    sending: "Enviando…",
    whatsapp: "Enviar por WhatsApp",
    phoneAppointment: "Cita telefónica",
    moreLooks: "Ver más",
    moreChanges: "Ver más cambios",
    prevPhoto: "Foto anterior",
    nextPhoto: "Foto siguiente",
    prevReviews: "Reseñas anteriores",
    nextReviews: "Reseñas siguientes",
    legalUpdated: "Actualizado",
    scrollDown: "Bajar",
    scrollUp: "Volver arriba",
    enlarge: "Ampliar",
  },
  intro: {
    styling: "Estilismo",
    training: "Formación",
    aesthetics: "Estética",
  },
  home: {
    kicker: "Estilismo para eventos y formación · Castellón · Valencia",
    heroLines: ["Belleza que", "se sostiene", "hasta el último baile."],
    heroCopy:
      "Estilismo integral de maquillaje, peinado y cuidado de la piel para parejas y personas especiales — novias, novios y novies. Trabajo bajo una premisa innegociable: que al mirarte al espejo, te sientas 100% tú. Un servicio exclusivo, elegante y sin artificios. Disponible en estudio y a domicilio.",
    looksKicker: "Parejas",
    looksTitle: "Los looks que mandan.",
    atelierTitle: "Cinco líneas. Una firma.",
    professionalsCard: "Formación para profesionales",
    baKicker: "Antes y después",
    baTitle: "El mismo rostro. Más tú.",
    baCopy:
      "La belleza real se defiende sola y, sobre todo, se reconoce. Aquí no verás modelos inalcanzables, sino personas reales. Tampoco encontrarás desenfoques ni retoques digitales. Cada antes y después es 100% auténtico, pensado para elevar tu imagen y respetar tu esencia, garantizando que siempre seas tu versión más fiel frente al espejo.",
    methodTitle: "El método",
    methodCopy:
      "Poco ruido, tres pasos. Así se trabaja cuando el maquillaje y el peinado tienen que durar de verdad, de la prueba al último baile.",
    lookbookCopy:
      "Mi trabajo en acción. Bodas reales, personas reales y estilismos creados para vivirse. Diseño looks de autor que traspasan la cámara y aguantan hasta el último baile, para que el recuerdo de tu día refleje exactamente quién eres.",
    faqTitle: "Preguntas frecuentes",
    contactTitle: "Hablemos de tu fecha.",
    contactCopy:
      "Reserva tu asesoría gratuita en el calendario para que hablemos de tu evento. Si no encuentras un horario que te encaje o tienes dudas previas, escríbeme directamente por WhatsApp.",
    portraitFallback: "Retrato",
  },
  ana: {
    heading: [
      "Belleza real.",
      "Servicio exclusivo.",
      "Estilismo nupcial de autor.",
    ],
    bio: "Esteticista y estilista desde 2004. Tras una etapa en California y consolidar mi carrera en Madrid, ahora traigo mi experiencia a mi nuevo estudio en Castellón. Aquí, tu look se cuida como se cuida un vestido: con tiempo y sin mentiras. Diseño estilismos para novias, novios y novies manteniendo un estándar innegociable de calidad y naturalidad, a través de un servicio exclusivo disponible íntegramente en español, inglés y francés.",
  },
  process: [
    {
      n: "I",
      title: "Consulta",
      text: "Fecha, ideas y piel. Escucho antes de proponer.",
    },
    {
      n: "II",
      title: "Prueba",
      text: "En estudio. Probamos hasta que te reconoces en el espejo.",
    },
    {
      n: "III",
      title: "El día",
      text: "Me desplazo. El look se sostiene impecable y tú solo te preocupas de disfrutar.",
    },
  ],
  faqs: [
    {
      q: "¿Con cuánta antelación debo reservar mi fecha?",
      a: "Dado que ofrezco un servicio exclusivo y atiendo un número limitado de bodas al año, te recomiendo reservar mínimo con entre 9 y 12 meses de antelación. Actualmente tengo abierta la agenda para 2026 y 2027.",
    },
    {
      q: "¿Te desplazas el día de la boda o debo ir al estudio?",
      a: "El día de tu boda me desplazo a tu domicilio, hotel o finca (principalmente en las zonas de Castellón y Valencia) para que te prepares con total tranquilidad. Las pruebas de diseño previas sí las realizamos siempre en mi estudio, donde dispongo de la luz y el material óptimo para trabajar los detalles aunque también tienes la opción de venir tú al estudio, como sea más cómodo para ti.",
    },
    {
      q: "¿En qué consiste exactamente la prueba de novia?",
      a: "La prueba no es un trámite rápido. Es una sesión en el estudio donde evaluamos tu piel, escucho tus ideas y diseñamos el look. Probamos técnica y acabados hasta lograr ese resultado exacto donde te miras y te reconoces al 100%.",
    },
    {
      q: "¿Puedes maquillar y peinar a la madrina o a las invitadas?",
      a: "Sí. Ofrezco servicio de estilismo para las acompañantes más cercanas, manteniendo el mismo estándar de calidad y naturalidad. El número de invitadas que puedo atender el mismo día dependerá de los horarios de la boda, por lo que lo organizaremos a medida y, en caso de ser necesario, dispongo de un equipo de estilistas con el que podremos atender a todas las personas que lo necesiten.",
    },
    {
      q: "No suelo maquillarme nunca y me da miedo verme disfrazada, ¿es tu servicio para mí?",
      a: 'Absolutamente. Mi especialidad y filosofía de trabajo es la "belleza real". No busco transformarte mediante capas pesadas de maquillaje ni contornos exagerados. Trabajo la técnica para elevar tu imagen respetando tu identidad; el objetivo es que sigas siendo tú, pero radiante e impecable.',
    },
    {
      q: "¿Qué pasa si tengo problemas de piel (acné, sensibilidad, rosácea)?",
      a: "Mi enfoque siempre parte de cuidar la piel desde la salud, no solo desde la estética. Antes del maquillaje realizamos una preparación exhaustiva y utilizo productos de alta gama que respetan tu dermis, asegurando que el look sea duradero y confortable y, si lo necesitas, podemos tratar tu piel meses antes de la boda para que luzcas radiante en tu día.",
    },
  ],
  gallery: {
    parejas: "Parejas",
    peinado: "Peinado",
    maquillaje: "Maquillaje",
  },
  contact: {
    name: "Nombre",
    email: "Email",
    phone: "Teléfono",
    date: "Fecha del evento",
    kind: "¿Qué buscas?",
    message: "Escribe tu consulta",
    kinds: [
      "Estilismo para eventos",
      "Tratamientos estéticos",
      "Cursos de automaquillaje",
      "Formación profesional",
    ],
    whatsappIntro: "Hola Ana, quiero información.",
    whatsappTitle: "WhatsApp",
    whatsappBody:
      "Si no se ha abierto WhatsApp, también puedes enviar directamente el formulario con el botón Enviar y te contactaré lo antes posible. O reserva una cita telefónica en el calendario.",
    errorTitle: "No se ha podido enviar",
    errorBody: "No he podido enviar el formulario. Prueba por WhatsApp.",
    sentTitle: "Consulta enviada",
    sentBody:
      "He recibido tu consulta. Te contesto lo antes posible en el correo o el teléfono que me has dejado.",
    sentActivate:
      "Para recibir las consultas en info@manymakeups.com, abre el correo de activación (mira también spam) y pulsa el enlace. A partir de entonces te llegarán solas.",
  },
  reviews: {
    kicker: "Reseñas de Google",
    google: "Ver en Google",
    roles: {
      Novia: "Novia",
      "Cuidado de la piel": "Cuidado de la piel",
      Evento: "Evento",
      "Glitter Bar": "Glitter Bar",
      "Hermana del novio": "Hermana del novio",
    },
  },
  footer: {
    legal: "Legal",
    notice: "Aviso legal",
    privacy: "Privacidad",
    cookies: "Cookies",
  },
  legal: {
    kicker: "Legal",
    noticeTitle: "Aviso legal",
    noticeDescription:
      "Aviso legal de Many Makeups by Ana Zarza. Información del titular, condiciones de uso y propiedad intelectual.",
    privacyTitle: "Política de privacidad",
    privacyDescription:
      "Cómo Many Makeups by Ana Zarza trata los datos personales de consultas, citas y reservas.",
    cookiesTitle: "Política de cookies",
    cookiesDescription:
      "Uso de cookies y almacenamiento local en Many Makeups by Ana Zarza.",
    originalNote:
      "La versión en español es la única con valor jurídico. Esta traducción se ofrece a título informativo.",
  },
  pages: {
    parejas: {
      navTitle: "Parejas",
      kicker: "Atelier · Parejas",
      title: "Estilismo nupcial integral",
      lead:
        "Diseño de look integral para novias, novios y novies. Acompañamiento experto y personalizado desde la primera prueba hasta que se apagan las luces, garantizando una presencia impecable durante toda la celebración.",
      seoTitle:
        "Maquillaje y peinado para parejas y bodas LGTBIQ+ en Castellón",
      seoDescription:
        "Maquillaje y peinado para novias, novios y novies en Nules, Castellón y Valencia. Bodas LGTBIQ+. Prueba en estudio, look de día y desplazamiento. Reserva tu fecha con Ana Zarza.",
      paragraphs: [
        "Sea cual sea el estilo de tu celebración, mi compromiso es innegociable. Diseño un plan integral de cuidado de la piel, maquillaje y peinado para que tu look se sostenga impecable frente a la cámara, la emoción y hasta el último baile. Todo ello con un único objetivo: que al mirarte al espejo te reconozcas al cien por cien.",
        "Con base en Nules y disponibilidad para desplazamientos en Castellón, Valencia y alrededores. Mi método comienza con una consulta detallada. Continuamos con una prueba en el estudio para perfeccionar cada detalle técnico del maquillaje y el peinado. El día del evento, me traslado donde me necesites para ofrecerte un servicio de preparación relajado, minucioso y sin prisas.",
      ],
      points: [
        {
          title: "Prueba en estudio",
          text: "Realizada en mi estudio bajo condiciones óptimas de iluminación. Diseño, probamos y ajusto el look hasta encontrar esa versión exacta que refleja tu esencia.",
        },
        {
          title: "El día completo",
          text: "Asistencia integral el día del evento. Me desplazo a tu ubicación para realizar el estilismo y, si lo necesitas, me quedo a tu lado durante la sesión de fotos para asegurar que cada detalle se mantiene perfecto.",
        },
        {
          title: "Corte y personas especiales",
          text: "Ofrezco el mismo nivel de excelencia, técnica y naturalidad para el maquillaje y peinado de familiares o invitados más cercanos.",
        },
      ],
    },
    eventos: {
      navTitle: "Eventos",
      kicker: "Atelier · Eventos",
      title: "Servicios de belleza y fantasía para eventos",
      lead:
        "Servicios exclusivos de Glitter Bar, Beauty Corner y Beauty Parties. Diseñamos un espacio de belleza sofisticado que aporta valor a tu evento y destaca por su elegancia, huyendo de los excesos y del ruido visual.",
      seoTitle: "Servicios de belleza y fantasía para eventos",
      seoDescription:
        "Maquillaje y peinado para eventos en Nules y Castellón: invitadas, Glitter Bar, beauty corner y beauty parties. Estilismo de alto nivel, sin teatro.",
      pullQuote: "Ritmo de atelier, no de cola",
      paragraphs: [
        "Servicios exclusivos de Glitter Bar, Beauty Corner y Beauty Parties en Nules y Castellón. Trasladamos nuestro criterio de elegancia y naturalidad a tu celebración, ya sea una boda, un evento corporativo o un lanzamiento de marca. Huimos del concepto de 'cola' y ofrecemos una experiencia de atelier en directo: productos premium, técnica impecable y un cuidado personalizado para que cada asistente disfrute del maquillaje como parte inolvidable del evento.",
      ],
      points: [
        {
          title: "Bridal Beauty Parties",
          text: "Transforma la despedida de soltera en una experiencia exclusiva. Vosotras elegís el formato (cuidado de la piel, maquillaje o glitter) y diseñamos una sesión privada para celebrar entre amigas.",
        },
        {
          title: "Talleres de Belleza y Masterclasses",
          text: "Desde dinámicas de team building para empresas hasta educación facial para adolescentes. Sesiones prácticas, exclusivas y a medida, orientadas a cuidar la salud de la piel y potenciar el autoconocimiento.",
        },
        {
          title: "Glitter Bar y beauty corner",
          text: "Un espacio de belleza en vivo para tu boda o evento. Retoques de maquillaje profesional y diseño con glitter bajo un trato exclusivo de atelier, huyendo de las prisas y las colas.",
        },
      ],
    },
    formacion: {
      navTitle: "Formación",
      kicker: "Atelier · Formación",
      title: "Automaquillaje: Técnica y Criterio",
      lead:
        "Formación privada y a medida. Aprende a diseñar tu propia imagen con técnica profesional, elegancia y resultados reales, sin artificios ni disfraces.",
      seoTitle: "Automaquillaje: Técnica y Criterio",
      seoDescription:
        "Formación privada de automaquillaje en Nules y Castellón. Técnica, criterio y un look que te reconoce en el espejo.",
      paragraphs: [
        "Olvida los tutoriales genéricos; aquí enseño criterio. Desde mi espacio en Nules (o a domicilio), ofrezco sesiones individuales o en petit comité. Trabajamos la luz, el color y la técnica para que domines un método infalible. Trae tu neceser: analizaremos los productos que ya tienes, conservaremos lo que funciona y puliremos los gestos que te sobran para que el resultado sea siempre impecable.",
      ],
      points: [
        {
          title: "Sesión exclusiva",
          text: "A tu ritmo y enfocada 100% en tu rostro. Saldrás con una rutina estructurada, realista y fácil de replicar.",
        },
        {
          title: "Filosofía Skin First",
          text: "Un buen maquillaje exige una piel honesta. Analizo tus necesidades para recomendarte solo lo que realmente suma a tu rutina.",
        },
        {
          title: "Enfoque evento",
          text: "Aprende a diseñar y ejecutar tú misma el look que llevarás en tu próxima celebración.",
        },
        {
          title: "Formación Profesional",
          text: "Los maquilladores y estilistas que buscan perfeccionar su oficio tienen su espacio dedicado en la sección de Profesionales.",
        },
      ],
    },
    piel: {
      navTitle: "Piel",
      kicker: "Atelier · Piel",
      title: "Cuidado Facial: Salud y Técnica",
      lead:
        "Diagnóstico experto, tratamientos en cabina y diseño de tu rutina en casa. Abordamos el cuidado de la piel desde la salud, la técnica y los resultados reales, lejos de las promesas vacías de un anuncio.",
      seoTitle: "Cuidado Facial: Salud y Técnica",
      seoDescription:
        "Diagnóstico de piel, cabina y rutina en casa en Nules y Castellón. Estética desde la salud, con Ana Zarza.",
      paragraphs: [
        "Entiendo la piel no como un complemento, sino como el verdadero origen de un buen maquillaje. Por eso, mi trabajo en cabina requiere tiempo y huye de los protocolos de escaparate. Buscamos resultados que aguanten la exigencia del día de tu boda y te acompañen en tu día a día, traduciendo el tratamiento a una rutina en casa realista y a medida.",
      ],
      points: [
        {
          title: "Diagnóstico",
          text: "Escuchamos las necesidades reales de tu piel hoy, no las modas del momento.",
        },
        {
          title: "Cabina",
          text: "Tratamiento facial con criterio clínico, calma y precisión. Resultados sin artificios ni teatros de spa.",
        },
        {
          title: "Rutina en casa",
          text: "Menos es más. Un régimen de pocos pasos muy bien elegidos. Si sabemos que no lo vas a usar, no sale por la puerta.",
        },
      ],
    },
    profesionales: {
      navTitle: "Profesionales",
      kicker: "Atelier · Profesionales",
      title: "Formación para Maquilladores y Estilistas",
      lead:
        "Mentoría avanzada para perfeccionar la técnica de maquillaje y peinado, y desarrollar un criterio profesional sólido. Un aprendizaje integral basado en el oficio real, que abarca desde el trabajo de estudio hasta la gestión estratégica de tu marca.",
      seoTitle: "Formación para Maquilladores y Estilistas",
      seoDescription:
        "Formación para profesionales del maquillaje y el peinado en Castellón y Valencia. Técnica, piel y criterio, con Ana Zarza.",
      paragraphs: [
        "Además del servicio nupcial a clientas, Many Makeups ofrece una línea de formación exclusiva para profesionales a nivel nacional. La exigencia es la misma que aplico en mis bodas: que el resultado se sostenga de principio a fin y que lleve tu sello de autor. No es un tutorial grabado ni un curso de escaparate. Enseño método: preparación de la piel para el maquillaje, color, visagismo, recogidos y el criterio técnico que eleva un simple look a la categoría de oficio. Y porque el talento técnico necesita una base sólida para sobrevivir, también te formo en la realidad del emprendimiento.",
      ],
      points: [
        {
          title: "Técnica con criterio",
          text: "Gestos precisos que funcionan tanto en la calma del estudio como en el exigente ritmo de una boda. Menos receta, más oficio.",
        },
        {
          title: "La piel en el centro",
          text: "El maquillaje profesional solo aguanta si el lienzo está bien preparado. Aprenderás a diagnosticar visualmente y a aplicar el producto con sentido antes de empezar a maquillar.",
        },
        {
          title: "Creación y gestión de negocio",
          text: "Dominar los pinceles y las planchas no es suficiente. Te enseño a estructurar tu empresa, edición de vídeo para redes y el manejo de las herramientas imprescindibles para construir un negocio próspero, visible y rentable.",
        },
        {
          title: "Formato a medida",
          text: "Mentorías privadas, grupos reducidos o formación in-company para equipos en cualquier punto de España. Diseñamos el programa adaptándonos a tu nivel y objetivos.",
        },
      ],
    },
  },
};

export const en: Messages = {
  meta: {
    homeTitle:
      "Bridal and event makeup and hair in Castellón | Many Makeups",
    homeDescription:
      "Makeup and hair for couples — brides, grooms and everyone getting married — and events in Nules and Castellón. Real beauty, high standing, by Ana Zarza.",
    ogTitle: "Many Makeups · Ana Zarza",
    notFoundTitle: "Page not found",
    notFoundHeading: "This page does not exist.",
    notFoundBody: "Return to the atelier, or write if you were looking for a date.",
    notFoundCta: "Back to home",
  },
  nav: {
    looks: "Trends",
    lookbook: "Lookbook",
    atelier: "Atelier",
    metodo: "Method",
    about: "About",
    contact: "Contact",
    principal: "Main",
    language: "Language",
  },
  common: {
    book: "Book an appointment",
    seeAtelier: "See the atelier",
    skip: "Skip",
    close: "Close",
    send: "Send",
    sending: "Sending…",
    whatsapp: "Send via WhatsApp",
    phoneAppointment: "Phone appointment",
    moreLooks: "See more",
    moreChanges: "See more changes",
    prevPhoto: "Previous photo",
    nextPhoto: "Next photo",
    prevReviews: "Previous reviews",
    nextReviews: "Next reviews",
    legalUpdated: "Updated",
    scrollDown: "Down",
    scrollUp: "Back to top",
    enlarge: "Enlarge",
  },
  intro: {
    styling: "Styling",
    training: "Training",
    aesthetics: "Aesthetics",
  },
  home: {
    kicker: "Event styling and training · Castellón · Valencia",
    heroLines: ["Beauty that", "holds", "until the last dance."],
    heroCopy:
      "Integral makeup, hair and skin styling for couples and the people closest to them — brides, grooms and everyone getting married. I work from one non-negotiable premise: that when you look in the mirror, you feel 100% yourself. An exclusive, elegant service, with no artifice. In studio and at home.",
    looksKicker: "Couples",
    looksTitle: "The looks that set the tone.",
    atelierTitle: "Five lines. One signature.",
    professionalsCard: "Training for professionals",
    baKicker: "Before and after",
    baTitle: "The same face. More you.",
    baCopy:
      "Real beauty stands on its own — and, above all, it is recognised. You will not find unattainable models here, but real people. No blur, no digital retouching. Every before and after is 100% authentic, designed to elevate your image and respect your essence, so the person in the mirror is still you.",
    methodTitle: "The method",
    methodCopy:
      "Little noise, three steps. This is how the work is done when makeup and hair have to last — from the trial to the last dance.",
    lookbookCopy:
      "My work in action. Real weddings, real people, styling made to be lived in. Author looks that hold on camera and until the last dance, so the memory of your day reflects exactly who you are.",
    faqTitle: "Frequently asked questions",
    contactTitle: "Let's talk about your date.",
    contactCopy:
      "Book a complimentary consultation in the calendar so we can talk about your event. If you cannot find a time that works, or you have questions first, write to me on WhatsApp.",
    portraitFallback: "Portrait",
  },
  ana: {
    heading: [
      "Real beauty.",
      "Exclusive service.",
      "Author bridal styling.",
    ],
    bio: "Aesthetician and stylist since 2004. After a chapter in California and building my career in Madrid, I now bring that experience to my new studio in Castellón. Here, your look is cared for the way a dress is cared for: with time, and without lies. I design styling for brides, grooms and everyone getting married, to a non-negotiable standard of quality and naturalness, through an exclusive service offered entirely in Spanish, English and French.",
  },
  process: [
    {
      n: "I",
      title: "Consultation",
      text: "Date, ideas and skin. I listen before I propose.",
    },
    {
      n: "II",
      title: "Trial",
      text: "In studio. We try until you recognise yourself in the mirror.",
    },
    {
      n: "III",
      title: "The day",
      text: "I travel to you. The look holds, impeccable, and you only have to enjoy it.",
    },
  ],
  faqs: [
    {
      q: "How far in advance should I book my date?",
      a: "I offer an exclusive service and take a limited number of weddings each year, so I recommend booking 9 to 12 months ahead. My diary is currently open for 2026 and 2027.",
    },
    {
      q: "Do you come to me on the wedding day, or do I come to the studio?",
      a: "On your wedding day I come to your home, hotel or venue (mainly in Castellón and Valencia) so you can get ready in complete calm. Design trials take place in my studio, where I have the right light and kit — though you can also come to the studio on the day if that is more comfortable.",
    },
    {
      q: "What exactly is the bridal trial?",
      a: "The trial is not a quick formality. It is a studio session where we assess your skin, I listen to your ideas and we design the look. We try technique and finish until you look in the mirror and recognise yourself completely.",
    },
    {
      q: "Can you do makeup and hair for the mother of the bride or guests?",
      a: "Yes. I offer styling for the people closest to you, to the same standard of quality and naturalness. How many I can take on the day depends on the wedding schedule; we will plan it around you, and if needed I have a team of stylists so everyone who needs it can be looked after.",
    },
    {
      q: "I barely wear makeup and I am afraid of looking like someone else. Is this for me?",
      a: "Absolutely. My work is grounded in real beauty. I do not transform you with heavy layers or exaggerated contour. I use technique to lift your image while respecting who you are — so you are still you, radiant and impeccable.",
    },
    {
      q: "What if I have skin issues (acne, sensitivity, rosacea)?",
      a: "I always start from skin health, not just aesthetics. Before makeup we prepare thoroughly and I use high-end products that respect the skin, so the look is lasting and comfortable. If you need it, we can work on your skin months before the wedding so you look radiant on the day.",
    },
  ],
  gallery: {
    parejas: "Couples",
    peinado: "Hair",
    maquillaje: "Makeup",
  },
  contact: {
    name: "Name",
    email: "Email",
    phone: "Phone",
    date: "Event date",
    kind: "What are you looking for?",
    message: "Write your enquiry",
    kinds: [
      "Event styling",
      "Skin treatments",
      "Self-makeup courses",
      "Professional training",
    ],
    whatsappIntro: "Hello Ana, I would like some information.",
    whatsappTitle: "WhatsApp",
    whatsappBody:
      "If WhatsApp did not open, you can also send the form with Send and I will get back to you as soon as I can. Or book a phone appointment in the calendar.",
    errorTitle: "Could not send",
    errorBody: "I could not send the form. Please try WhatsApp.",
    sentTitle: "Enquiry sent",
    sentBody:
      "I have received your enquiry. I will reply as soon as I can on the email or phone you left.",
    sentActivate:
      "To receive enquiries at info@manymakeups.com, open the activation email (check spam too) and tap the link. After that they will arrive on their own.",
  },
  reviews: {
    kicker: "Google reviews",
    google: "See on Google",
    roles: {
      Novia: "Bride",
      "Cuidado de la piel": "Skin care",
      Evento: "Event",
      "Glitter Bar": "Glitter Bar",
      "Hermana del novio": "Groom's sister",
    },
  },
  footer: {
    legal: "Legal",
    notice: "Legal notice",
    privacy: "Privacy",
    cookies: "Cookies",
  },
  legal: {
    kicker: "Legal",
    noticeTitle: "Legal notice",
    noticeDescription:
      "Legal notice for Many Makeups by Ana Zarza. Owner information, terms of use and intellectual property.",
    privacyTitle: "Privacy policy",
    privacyDescription:
      "How Many Makeups by Ana Zarza handles personal data from enquiries, appointments and bookings.",
    cookiesTitle: "Cookie policy",
    cookiesDescription:
      "Cookies and local storage on Many Makeups by Ana Zarza.",
    originalNote:
      "The Spanish version is the only legally binding text. This translation is provided for information only.",
  },
  pages: {
    parejas: {
      navTitle: "Couples",
      kicker: "Atelier · Couples",
      title: "Integral bridal styling",
      lead:
        "Full look design for brides, grooms and everyone getting married. Expert, personal accompaniment from the first trial until the lights go down, so your presence stays impeccable through the whole celebration.",
      seoTitle: "Makeup and hair for couples and LGTBIQ+ weddings in Castellón",
      seoDescription:
        "Makeup and hair for brides, grooms and everyone getting married in Nules, Castellón and Valencia. LGTBIQ+ weddings. Studio trial, day look and travel. Book your date with Ana Zarza.",
      paragraphs: [
        "Whatever the style of your celebration, my commitment is non-negotiable. I design an integral plan of skin care, makeup and hair so your look holds impeccably for the camera, the emotion and the last dance. One aim only: that when you look in the mirror you recognise yourself completely.",
        "Based in Nules, with travel across Castellón, Valencia and surroundings. The method starts with a detailed consultation. Then a studio trial to refine every technical detail of makeup and hair. On the day I come to you for a calm, meticulous, unhurried preparation.",
      ],
      points: [
        {
          title: "Studio trial",
          text: "Held in my studio under optimal lighting. We design, try and adjust the look until we find the exact version that reflects who you are.",
        },
        {
          title: "The full day",
          text: "Integral support on the day. I travel to you for the styling and, if you need me, I stay through the photographs so every detail stays perfect.",
        },
        {
          title: "Party and special people",
          text: "The same standard of excellence, technique and naturalness for makeup and hair for family or your closest guests.",
        },
      ],
    },
    eventos: {
      navTitle: "Events",
      kicker: "Atelier · Events",
      title: "Beauty and fantasy services for events",
      lead:
        "Exclusive Glitter Bar, Beauty Corner and Beauty Party services. We design a sophisticated beauty space that adds value to your event and stands out for its elegance — never excess or visual noise.",
      seoTitle: "Beauty and fantasy services for events",
      seoDescription:
        "Event makeup and hair in Nules and Castellón: Glitter Bar, beauty corner and beauty parties. High-level styling, no theatre.",
      pullQuote: "Atelier pace, not a queue",
      paragraphs: [
        "Exclusive Glitter Bar, Beauty Corner and Beauty Party services in Nules and Castellón. We bring our standard of elegance and naturalness to your celebration — a wedding, a corporate event or a brand launch. We reject the idea of a queue and offer a live atelier experience: premium products, impeccable technique and personal care, so every guest enjoys makeup as an unforgettable part of the event.",
      ],
      points: [
        {
          title: "Bridal Beauty Parties",
          text: "Turn the hen party into an exclusive experience. You choose the format (skin care, makeup or glitter) and we design a private session to celebrate among friends.",
        },
        {
          title: "Beauty workshops and masterclasses",
          text: "From corporate team-building to facial education for teenagers. Practical, exclusive, tailored sessions, focused on skin health and self-knowledge.",
        },
        {
          title: "Glitter Bar and beauty corner",
          text: "A live beauty space for your wedding or event. Professional makeup touch-ups and glitter design with an exclusive atelier manner — no rush, no queues.",
        },
      ],
    },
    formacion: {
      navTitle: "Training",
      kicker: "Atelier · Training",
      title: "Self-makeup: Technique and judgement",
      lead:
        "Private, tailored training. Learn to design your own image with professional technique, elegance and real results — no artifice, no costume.",
      seoTitle: "Self-makeup: Technique and judgement",
      seoDescription:
        "Private self-makeup training in Nules and Castellón. Technique, judgement and a look you recognise in the mirror.",
      paragraphs: [
        "Forget generic tutorials; here I teach judgement. From my space in Nules (or at your home), I offer one-to-one sessions or a petit comité. We work light, colour and technique so you master a method you can rely on. Bring your kit: we will look at what you already own, keep what works and refine the gestures you do not need, so the result is always impeccable.",
      ],
      points: [
        {
          title: "Exclusive session",
          text: "At your pace and focused 100% on your face. You leave with a structured, realistic routine you can repeat.",
        },
        {
          title: "Skin First philosophy",
          text: "Good makeup needs honest skin. I assess what you actually need and recommend only what adds to your routine.",
        },
        {
          title: "Event focus",
          text: "Learn to design and carry out yourself the look you will wear at your next celebration.",
        },
        {
          title: "Professional training",
          text: "Makeup artists and stylists who want to refine their craft have a dedicated space in the Professionals section.",
        },
      ],
    },
    piel: {
      navTitle: "Skin",
      kicker: "Atelier · Skin",
      title: "Facial care: Health and technique",
      lead:
        "Expert diagnosis, in-cabin treatments and a home routine designed for you. We approach skin from health, technique and real results — far from empty advertising promises.",
      seoTitle: "Facial care: Health and technique",
      seoDescription:
        "Skin diagnosis, cabin and home routine in Nules and Castellón. Aesthetics from health, with Ana Zarza.",
      paragraphs: [
        "I do not treat skin as an accessory, but as the true origin of good makeup. That is why cabin work takes time and refuses shop-window protocols. We look for results that hold the demands of your wedding day and stay with you every day after, turning the treatment into a realistic, tailored routine at home.",
      ],
      points: [
        {
          title: "Diagnosis",
          text: "We listen to what your skin needs today — not the fashion of the moment.",
        },
        {
          title: "Cabin",
          text: "Facial treatment with clinical judgement, calm and precision. Results without artifice or spa theatre.",
        },
        {
          title: "Home routine",
          text: "Less is more. A regime of a few, very well chosen steps. If we know you will not use it, it does not leave the studio.",
        },
      ],
    },
    profesionales: {
      navTitle: "Professionals",
      kicker: "Atelier · Professionals",
      title: "Training for makeup artists and stylists",
      lead:
        "Advanced mentoring to refine makeup and hair technique and build solid professional judgement. Integral learning grounded in real craft, from studio work to the strategic running of your brand.",
      seoTitle: "Training for makeup artists and stylists",
      seoDescription:
        "Professional makeup and hair training in Castellón and Valencia. Technique, skin and judgement, with Ana Zarza.",
      paragraphs: [
        "Alongside bridal work for clients, Many Makeups offers an exclusive training line for professionals nationwide. The standard is the same as in my weddings: the result has to hold from start to finish, and carry your author signature. This is not a recorded tutorial or a shop-window course. I teach method: skin preparation for makeup, colour, visagism, updos and the technical judgement that lifts a look into a craft. And because technical talent needs a solid base to survive, I also train you in the reality of running a business.",
      ],
      points: [
        {
          title: "Technique with judgement",
          text: "Precise gestures that work in the calm of the studio and in the demanding rhythm of a wedding. Less recipe, more craft.",
        },
        {
          title: "Skin at the centre",
          text: "Professional makeup only holds if the canvas is well prepared. You will learn to diagnose by eye and apply product with sense before you start making up.",
        },
        {
          title: "Building and running a business",
          text: "Mastering brushes and irons is not enough. I teach you to structure your company, edit video for social media and handle the tools you need to build a prosperous, visible, profitable business.",
        },
        {
          title: "Tailored format",
          text: "Private mentoring, small groups or in-company training for teams anywhere in Spain. We design the programme around your level and aims.",
        },
      ],
    },
  },
};

export const fr: Messages = {
  meta: {
    homeTitle:
      "Maquillage et coiffure pour mariages et événements à Castellón | Many Makeups",
    homeDescription:
      "Maquillage et coiffure pour les couples — mariées, mariés et toutes les personnes qui se marient — et les événements à Nules et Castellón. Beauté réelle, haut standing, par Ana Zarza.",
    ogTitle: "Many Makeups · Ana Zarza",
    notFoundTitle: "Page introuvable",
    notFoundHeading: "Cette page n’existe pas.",
    notFoundBody: "Reviens à l’atelier, ou écris si tu cherchais une date.",
    notFoundCta: "Retour à l’accueil",
  },
  nav: {
    looks: "Tendances",
    lookbook: "Lookbook",
    atelier: "Atelier",
    metodo: "Méthode",
    about: "À propos",
    contact: "Contact",
    principal: "Principal",
    language: "Langue",
  },
  common: {
    book: "Réserver un rendez-vous",
    seeAtelier: "Voir l’atelier",
    skip: "Passer",
    close: "Fermer",
    send: "Envoyer",
    sending: "Envoi…",
    whatsapp: "Envoyer par WhatsApp",
    phoneAppointment: "Rendez-vous téléphonique",
    moreLooks: "Voir plus",
    moreChanges: "Voir plus de changements",
    prevPhoto: "Photo précédente",
    nextPhoto: "Photo suivante",
    prevReviews: "Avis précédents",
    nextReviews: "Avis suivants",
    legalUpdated: "Mis à jour",
    scrollDown: "Descendre",
    scrollUp: "Haut de page",
    enlarge: "Agrandir",
  },
  intro: {
    styling: "Stylisme",
    training: "Formation",
    aesthetics: "Esthétique",
  },
  home: {
    kicker: "Stylisme pour événements et formation · Castellón · Valence",
    heroLines: ["Une beauté qui", "tient", "jusqu’au dernier bal."],
    heroCopy:
      "Stylisme intégral de maquillage, coiffure et soin de la peau pour les couples et les personnes qui comptent — mariées, mariés et toutes les personnes qui se marient. Je travaille selon une prémisse non négociable : que, devant le miroir, tu te sentes 100 % toi. Un service exclusif, élégant, sans artifice. En studio et à domicile.",
    looksKicker: "Couples",
    looksTitle: "Les looks qui donnent le ton.",
    atelierTitle: "Cinq lignes. Une signature.",
    professionalsCard: "Formation pour professionnels",
    baKicker: "Avant / après",
    baTitle: "Le même visage. Plus toi.",
    baCopy:
      "La beauté réelle se défend seule — et, surtout, se reconnaît. Ici, pas de mannequins inaccessibles, mais des personnes réelles. Pas de flou, pas de retouche numérique. Chaque avant/après est 100 % authentique, pensé pour élever ton image et respecter ton essence, pour que tu restes ta version la plus fidèle devant le miroir.",
    methodTitle: "La méthode",
    methodCopy:
      "Peu de bruit, trois étapes. Ainsi se travaille quand le maquillage et la coiffure doivent vraiment tenir, de l’essayage au dernier bal.",
    lookbookCopy:
      "Mon travail en action. Mariages réels, personnes réelles, stylismes faits pour être vécus. Des looks d’auteur qui tiennent à la caméra et jusqu’au dernier bal, pour que le souvenir de ton jour reflète exactement qui tu es.",
    faqTitle: "Questions fréquentes",
    contactTitle: "Parlons de ta date.",
    contactCopy:
      "Réserve une consultation offerte dans le calendrier pour parler de ton événement. Si tu ne trouves pas d’horaire, ou si tu as des questions d’abord, écris-moi directement sur WhatsApp.",
    portraitFallback: "Portrait",
  },
  ana: {
    heading: [
      "Beauté réelle.",
      "Service exclusif.",
      "Stylisme nuptial d’auteur.",
    ],
    bio: "Esthéticienne et styliste depuis 2004. Après un chapitre en Californie et avoir consolidé ma carrière à Madrid, j’apporte désormais cette expérience à mon nouveau studio à Castellón. Ici, ton look est soigné comme on soigne une robe : avec du temps, et sans mensonges. Je conçois des stylismes pour mariées, mariés et toutes les personnes qui se marient, selon un standard non négociable de qualité et de naturel, via un service exclusif entièrement disponible en espagnol, anglais et français.",
  },
  process: [
    {
      n: "I",
      title: "Consultation",
      text: "Date, idées et peau. J’écoute avant de proposer.",
    },
    {
      n: "II",
      title: "Essayage",
      text: "En studio. On essaie jusqu’à ce que tu te reconnaisses dans le miroir.",
    },
    {
      n: "III",
      title: "Le jour",
      text: "Je me déplace. Le look tient, impeccable, et tu n’as plus qu’à profiter.",
    },
  ],
  faqs: [
    {
      q: "Combien de temps à l’avance dois-je réserver ma date ?",
      a: "J’offre un service exclusif et n’accepte qu’un nombre limité de mariages par an : je recommande de réserver 9 à 12 mois à l’avance. L’agenda est ouvert pour 2026 et 2027.",
    },
    {
      q: "Te déplaces-tu le jour du mariage, ou dois-je venir au studio ?",
      a: "Le jour de ton mariage, je me déplace à ton domicile, hôtel ou domaine (surtout Castellón et Valence) pour que tu te prépares en toute tranquillité. Les essayages de création ont lieu dans mon studio, où j’ai la lumière et le matériel justes — tu peux aussi venir au studio le jour J si c’est plus confortable.",
    },
    {
      q: "En quoi consiste exactement l’essayage de mariée ?",
      a: "L’essayage n’est pas une formalité rapide. C’est une séance en studio où nous évaluons ta peau, j’écoute tes idées et nous concevons le look. On essaie technique et finis jusqu’à ce que tu te regardes et te reconnaisses à 100 %.",
    },
    {
      q: "Peux-tu maquiller et coiffer la mère de la mariée ou des invitées ?",
      a: "Oui. J’offre le stylisme aux personnes les plus proches, au même standard de qualité et de naturel. Le nombre que je peux prendre le même jour dépend des horaires du mariage ; on l’organise sur mesure et, si besoin, je dispose d’une équipe de stylistes pour accueillir toutes les personnes concernées.",
    },
    {
      q: "Je ne me maquille presque jamais et j’ai peur de ne plus me reconnaître. Est-ce pour moi ?",
      a: "Absolument. Ma philosophie, c’est la « beauté réelle ». Je ne te transforme pas avec des couches lourdes ni un contouring outrancier. Je travaille la technique pour élever ton image en respectant qui tu es : tu restes toi, radieuse et impeccable.",
    },
    {
      q: "Et si j’ai des problèmes de peau (acné, sensibilité, rosacée) ?",
      a: "Je pars toujours de la santé de la peau, pas seulement de l’esthétique. Avant le maquillage, nous préparons en profondeur et j’utilise des produits haut de gamme qui respectent le derme, pour un look durable et confortable. Si tu en as besoin, nous pouvons travailler ta peau des mois avant le mariage pour que tu sois radieuse ce jour-là.",
    },
  ],
  gallery: {
    parejas: "Couples",
    peinado: "Coiffure",
    maquillaje: "Maquillage",
  },
  contact: {
    name: "Nom",
    email: "Email",
    phone: "Téléphone",
    date: "Date de l’événement",
    kind: "Que cherches-tu ?",
    message: "Écris ta demande",
    kinds: [
      "Stylisme pour événements",
      "Soins esthétiques",
      "Cours d’automaquillage",
      "Formation professionnelle",
    ],
    whatsappIntro: "Bonjour Ana, je souhaite des informations.",
    whatsappTitle: "WhatsApp",
    whatsappBody:
      "Si WhatsApp ne s’est pas ouvert, tu peux aussi envoyer le formulaire avec Envoyer et je te répondrai dès que possible. Ou réserve un rendez-vous téléphonique dans le calendrier.",
    errorTitle: "Envoi impossible",
    errorBody: "Je n’ai pas pu envoyer le formulaire. Essaie par WhatsApp.",
    sentTitle: "Demande envoyée",
    sentBody:
      "J’ai bien reçu ta demande. Je te réponds dès que possible sur l’email ou le téléphone que tu m’as laissés.",
    sentActivate:
      "Pour recevoir les demandes sur info@manymakeups.com, ouvre l’email d’activation (regarde aussi les indésirables) et clique sur le lien. Ensuite, elles arriveront toutes seules.",
  },
  reviews: {
    kicker: "Avis Google",
    google: "Voir sur Google",
    roles: {
      Novia: "Mariée",
      "Cuidado de la piel": "Soin de la peau",
      Evento: "Événement",
      "Glitter Bar": "Glitter Bar",
      "Hermana del novio": "Sœur du marié",
    },
  },
  footer: {
    legal: "Mentions",
    notice: "Mentions légales",
    privacy: "Confidentialité",
    cookies: "Cookies",
  },
  legal: {
    kicker: "Mentions",
    noticeTitle: "Mentions légales",
    noticeDescription:
      "Mentions légales de Many Makeups by Ana Zarza. Titulaire, conditions d’utilisation et propriété intellectuelle.",
    privacyTitle: "Politique de confidentialité",
    privacyDescription:
      "Comment Many Makeups by Ana Zarza traite les données personnelles des demandes, rendez-vous et réservations.",
    cookiesTitle: "Politique de cookies",
    cookiesDescription:
      "Cookies et stockage local sur Many Makeups by Ana Zarza.",
    originalNote:
      "La version en espagnol est la seule juridiquement opposable. Cette traduction est fournie à titre informatif.",
  },
  pages: {
    parejas: {
      navTitle: "Couples",
      kicker: "Atelier · Couples",
      title: "Stylisme nuptial intégral",
      lead:
        "Création de look intégral pour mariées, mariés et toutes les personnes qui se marient. Un accompagnement expert et personnel, de la première essayage jusqu’à l’extinction des lumières, pour une présence impeccable tout au long de la célébration.",
      seoTitle:
        "Maquillage et coiffure pour couples et mariages LGTBIQ+ à Castellón",
      seoDescription:
        "Maquillage et coiffure pour mariées, mariés et toutes les personnes qui se marient à Nules, Castellón et Valence. Mariages LGTBIQ+. Essayage en studio, look du jour et déplacement. Réserve ta date avec Ana Zarza.",
      paragraphs: [
        "Quel que soit le style de ta célébration, mon engagement n’est pas négociable. Je conçois un plan intégral de soin de la peau, maquillage et coiffure pour que ton look tienne, impeccable, face à la caméra, à l’émotion et jusqu’au dernier bal. Un seul objectif : que, devant le miroir, tu te reconnaisses à cent pour cent.",
        "Basée à Nules, avec déplacements à Castellón, Valence et alentours. La méthode commence par une consultation détaillée. Puis un essayage en studio pour affiner chaque détail technique du maquillage et de la coiffure. Le jour de l’événement, je me rends où tu as besoin de moi pour une préparation calme, minutieuse, sans précipitation.",
      ],
      points: [
        {
          title: "Essayage en studio",
          text: "Réalisé dans mon studio, sous un éclairage optimal. On conçoit, on essaie et j’ajuste le look jusqu’à trouver la version exacte qui reflète qui tu es.",
        },
        {
          title: "La journée complète",
          text: "Accompagnement intégral le jour J. Je me déplace pour le stylisme et, si tu en as besoin, je reste pendant la séance photo pour que chaque détail reste parfait.",
        },
        {
          title: "Cortège et personnes chères",
          text: "Le même niveau d’excellence, de technique et de naturel pour le maquillage et la coiffure de la famille ou des invités les plus proches.",
        },
      ],
    },
    eventos: {
      navTitle: "Événements",
      kicker: "Atelier · Événements",
      title: "Services de beauté et de fantaisie pour événements",
      lead:
        "Services exclusifs de Glitter Bar, Beauty Corner et Beauty Parties. Nous concevons un espace beauté sophistiqué qui apporte de la valeur à ton événement et se distingue par son élégance, loin des excès et du bruit visuel.",
      seoTitle: "Services de beauté et de fantaisie pour événements",
      seoDescription:
        "Maquillage et coiffure pour événements à Nules et Castellón : Glitter Bar, beauty corner et beauty parties. Stylisme de haut niveau, sans théâtre.",
      pullQuote: "Rythme d’atelier, pas de file",
      paragraphs: [
        "Services exclusifs de Glitter Bar, Beauty Corner et Beauty Parties à Nules et Castellón. Nous apportons notre critère d’élégance et de naturel à ta célébration — mariage, événement d’entreprise ou lancement de marque. Nous refusons l’idée de la « file » et offrons une expérience d’atelier en direct : produits premium, technique impeccable et soin personnalisé, pour que chaque personne présente vive le maquillage comme une part inoubliable de l’événement.",
      ],
      points: [
        {
          title: "Bridal Beauty Parties",
          text: "Transforme l’enterrement de vie de jeune fille en une expérience exclusive. Vous choisissez le format (soin de la peau, maquillage ou glitter) et nous concevons une séance privée entre amies.",
        },
        {
          title: "Ateliers beauté et masterclasses",
          text: "Du team building d’entreprise à l’éducation faciale pour les adolescents. Séances pratiques, exclusives et sur mesure, orientées vers la santé de la peau et la connaissance de soi.",
        },
        {
          title: "Glitter Bar et beauty corner",
          text: "Un espace beauté en direct pour ton mariage ou ton événement. Retouches de maquillage professionnel et dessin au glitter, dans un rapport d’atelier exclusif, loin de la précipitation et des files.",
        },
      ],
    },
    formacion: {
      navTitle: "Formation",
      kicker: "Atelier · Formation",
      title: "Automaquillage : technique et jugement",
      lead:
        "Formation privée et sur mesure. Apprends à concevoir ta propre image avec une technique professionnelle, de l’élégance et des résultats réels, sans artifice ni déguisement.",
      seoTitle: "Automaquillage : technique et jugement",
      seoDescription:
        "Formation privée d’automaquillage à Nules et Castellón. Technique, jugement et un look que tu reconnais dans le miroir.",
      paragraphs: [
        "Oublie les tutoriels génériques ; ici, j’enseigne le jugement. Depuis mon espace à Nules (ou à domicile), je propose des séances individuelles ou en petit comité. Nous travaillons la lumière, la couleur et la technique pour que tu maîtrises une méthode infaillible. Apporte ton nécessaire : nous analyserons ce que tu as déjà, garderons ce qui fonctionne et affinerons les gestes en trop, pour un résultat toujours impeccable.",
      ],
      points: [
        {
          title: "Séance exclusive",
          text: "À ton rythme, 100 % centrée sur ton visage. Tu repars avec une routine structurée, réaliste et facile à reproduire.",
        },
        {
          title: "Philosophie Skin First",
          text: "Un bon maquillage exige une peau honnête. J’analyse tes besoins pour ne te recommander que ce qui ajoute vraiment à ta routine.",
        },
        {
          title: "Focus événement",
          text: "Apprends à concevoir et à réaliser toi-même le look que tu porteras à ta prochaine célébration.",
        },
        {
          title: "Formation professionnelle",
          text: "Les maquilleurs et stylistes qui veulent perfectionner leur métier ont un espace dédié dans la section Professionnels.",
        },
      ],
    },
    piel: {
      navTitle: "Peau",
      kicker: "Atelier · Peau",
      title: "Soin du visage : santé et technique",
      lead:
        "Diagnostic expert, soins en cabine et routine à la maison conçue pour toi. Nous abordons le soin de la peau par la santé, la technique et les résultats réels, loin des promesses vides d’une publicité.",
      seoTitle: "Soin du visage : santé et technique",
      seoDescription:
        "Diagnostic de peau, cabine et routine à la maison à Nules et Castellón. Esthétique depuis la santé, avec Ana Zarza.",
      paragraphs: [
        "Je ne vois pas la peau comme un complément, mais comme la véritable origine d’un bon maquillage. C’est pourquoi le travail en cabine prend du temps et refuse les protocoles de vitrine. Nous cherchons des résultats qui tiennent l’exigence du jour de ton mariage et t’accompagnent au quotidien, en traduisant le soin en une routine à la maison réaliste et sur mesure.",
      ],
      points: [
        {
          title: "Diagnostic",
          text: "Nous écoutons les besoins réels de ta peau aujourd’hui, pas les modes du moment.",
        },
        {
          title: "Cabine",
          text: "Soin du visage avec un jugement clinique, du calme et de la précision. Des résultats sans artifice ni théâtre de spa.",
        },
        {
          title: "Routine à la maison",
          text: "Moins, c’est plus. Un régime de quelques gestes très bien choisis. Si nous savons que tu ne l’utiliseras pas, il ne sort pas du studio.",
        },
      ],
    },
    profesionales: {
      navTitle: "Professionnels",
      kicker: "Atelier · Professionnels",
      title: "Formation pour maquilleurs et stylistes",
      lead:
        "Mentorat avancé pour perfectionner la technique de maquillage et de coiffure, et construire un jugement professionnel solide. Un apprentissage intégral ancré dans le métier réel, du travail en studio à la gestion stratégique de ta marque.",
      seoTitle: "Formation pour maquilleurs et stylistes",
      seoDescription:
        "Formation professionnelle de maquillage et de coiffure à Castellón et Valence. Technique, peau et jugement, avec Ana Zarza.",
      paragraphs: [
        "Au-delà du service nuptial aux clientes, Many Makeups offre une ligne de formation exclusive pour les professionnels à l’échelle nationale. L’exigence est la même que celle que j’applique à mes mariages : que le résultat tienne du début à la fin et porte ta signature d’auteur. Ce n’est ni un tutoriel enregistré ni un cours de vitrine. J’enseigne une méthode : préparation de la peau au maquillage, couleur, visagisme, chignons et le jugement technique qui élève un look au rang de métier. Et parce que le talent technique a besoin d’une base solide pour durer, je te forme aussi à la réalité de l’entrepreneuriat.",
      ],
      points: [
        {
          title: "Technique avec jugement",
          text: "Des gestes précis qui fonctionnent dans le calme du studio comme dans le rythme exigeant d’un mariage. Moins de recette, plus de métier.",
        },
        {
          title: "La peau au centre",
          text: "Le maquillage professionnel ne tient que si la toile est bien préparée. Tu apprendras à diagnostiquer visuellement et à appliquer le produit avec sens avant de commencer à maquiller.",
        },
        {
          title: "Création et gestion d’entreprise",
          text: "Maîtriser les pinceaux et les lisseurs ne suffit pas. Je t’enseigne à structurer ton entreprise, le montage vidéo pour les réseaux et les outils indispensables pour construire une activité prospère, visible et rentable.",
        },
        {
          title: "Format sur mesure",
          text: "Mentorats privés, petits groupes ou formation in-company pour des équipes partout en Espagne. Nous concevons le programme selon ton niveau et tes objectifs.",
        },
      ],
    },
  },
};

const catalog: Record<Locale, Messages> = { es, en, fr };

export function getMessages(locale: Locale = defaultLocale): Messages {
  return catalog[locale] ?? es;
}
