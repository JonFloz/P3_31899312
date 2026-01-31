import React from 'react';
import '../styles/Legal.css';

const Privacy = () => {
  return (
    <div className="legal-container">
      <div className="legal-content">
        <h1>Política de Privacidad</h1>
        <p className="last-updated">Última actualización: 30 de enero de 2026</p>

        <section className="legal-section">
          <h2>1. Introducción</h2>
          <p>
            En jonMangas, tu privacidad es importante para nosotros. Esta Política de Privacidad 
            explica cómo recopilamos, usamos, divulgamos y salvaguardamos tu información cuando 
            utilizas nuestro sitio web.
          </p>
          <p>
            Te recomendamos que leas esta Política de Privacidad cuidadosamente. Si tienes 
            preguntas, contáctanos usando la información de contacto al final de este documento.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Información que Recopilamos</h2>
          <p>
            Recopilamos información de varias maneras:
          </p>

          <h3>A. Información que nos proporcionas directamente:</h3>
          <ul>
            <li><strong>Datos de Registro:</strong> Nombre, email, contraseña, dirección</li>
            <li><strong>Datos de Pago:</strong> Información de tarjeta de crédito (procesada de forma segura)</li>
            <li><strong>Datos de Perfil:</strong> Avatar, biografía, preferencias</li>
            <li><strong>Comunicaciones:</strong> Mensajes, comentarios, reseñas de productos</li>
            <li><strong>Información de Contacto:</strong> Teléfono, email alternativo</li>
          </ul>

          <h3>B. Información recopilada automáticamente:</h3>
          <ul>
            <li><strong>Datos de Acceso:</strong> Dirección IP, tipo de navegador, sistema operativo</li>
            <li><strong>Cookies:</strong> Identificadores de sesión, preferencias de usuario</li>
            <li><strong>Datos de Comportamiento:</strong> Páginas visitadas, tiempo en el sitio, enlaces clickeados</li>
            <li><strong>Ubicación:</strong> País/región (basado en IP, no GPS)</li>
            <li><strong>Dispositivo:</strong> Tipo de dispositivo, resolución de pantalla, idioma</li>
          </ul>

          <h3>C. Información de terceros:</h3>
          <ul>
            <li>Información de proveedores de pago (para procesar transacciones)</li>
            <li>Información de redes sociales (si decides conectar tu cuenta)</li>
            <li>Datos de empresas de análisis (para mejorar tu experiencia)</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. Cómo Usamos Tu Información</h2>
          <p>
            Usamos la información recopilada para:
          </p>
          <ul>
            <li><strong>Proporcionar Servicios:</strong> Procesar pedidos, enviar productos, proporcionar soporte</li>
            <li><strong>Mejorar Experiencia:</strong> Personalizar contenido, recordar preferencias, analizar uso</li>
            <li><strong>Comunicaciones:</strong> Enviarte confirmaciones de pedidos, actualizaciones, promociones</li>
            <li><strong>Seguridad:</strong> Detectar fraude, prevenir abusos, proteger sistemas</li>
            <li><strong>Cumplimiento Legal:</strong> Cumplir leyes, regulaciones y requisitos legales</li>
            <li><strong>Marketing:</strong> Enviarte ofertas personalizadas (solo si aceptaste)</li>
            <li><strong>Análisis:</strong> Entender cómo se usa el sitio, identificar tendencias</li>
            <li><strong>Desarrollo:</strong> Mejorar características, crear nuevos productos</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>4. Base Legal para el Procesamiento</h2>
          <p>
            Procesamos tu información basándonos en:
          </p>
          <ul>
            <li><strong>Consentimiento:</strong> Cuando aceptas esta política al registrarte</li>
            <li><strong>Contrato:</strong> Para procesar tus pedidos y proporcionar servicios</li>
            <li><strong>Obligación Legal:</strong> Para cumplir con leyes impositivas y antifraud</li>
            <li><strong>Intereses Legítimos:</strong> Para mejorar seguridad, prevenir fraude, mejorar servicios</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>5. Almacenamiento y Seguridad de Datos</h2>
          <p>
            <strong>Ubicación:</strong> Tu información se almacena en servidores localizados 
            en infraestructura segura con acceso restringido.
          </p>

          <h3>Medidas de Seguridad:</h3>
          <ul>
            <li>✅ Encriptación SSL/TLS para datos en tránsito</li>
            <li>✅ Encriptación de base de datos para datos en reposo</li>
            <li>✅ Hash bcrypt para contraseñas (nunca almacenadas en texto plano)</li>
            <li>✅ Firewall y protección contra DDoS</li>
            <li>✅ Control de acceso basado en roles (RBAC)</li>
            <li>✅ Auditoría y logging de accesos</li>
            <li>✅ Copias de seguridad automáticas</li>
            <li>✅ Monitoreo 24/7 de actividad sospechosa</li>
          </ul>

          <h3>Retención de Datos:</h3>
          <ul>
            <li>Datos de cuenta: Mientras tu cuenta esté activa + 30 días después de eliminación</li>
            <li>Datos de transacción: 7 años (requerido por leyes fiscales)</li>
            <li>Datos de cookies: 12 meses</li>
            <li>Logs de acceso: 90 días</li>
          </ul>

          <p>
            <strong>Nota Importante:</strong> Aunque implementamos medidas de seguridad robustas, 
            ninguna transmisión de datos por internet es 100% segura. No podemos garantizar 
            seguridad absoluta, pero trabajamos diligentemente para proteger tu información.
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Compartir Información con Terceros</h2>
          <p>
            No vendemos tu información personal. La compartimos solo en estos casos:
          </p>

          <h3>Terceros Necesarios para Operación:</h3>
          <ul>
            <li><strong>Procesadores de Pago:</strong> Para procesar transacciones (Stripe, PayPal, etc.)</li>
            <li><strong>Proveedores de Envío:</strong> Tu dirección para entregas</li>
            <li><strong>Analítica:</strong> Google Analytics (datos anónimos)</li>
            <li><strong>Hosting:</strong> Servidores en la nube</li>
            <li><strong>Email:</strong> Proveedores para enviar mensajes</li>
          </ul>

          <h3>Casos Legales:</h3>
          <ul>
            <li>Cuando lo requiera la ley o orden judicial</li>
            <li>Para proteger derechos, seguridad o propiedad</li>
            <li>En caso de fusión, adquisición o insolvencia</li>
          </ul>

          <p>
            Todos los terceros están obligados por contrato a mantener confidencialidad 
            y usar la información solo para propósitos especificados.
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Cookies y Tecnologías Similares</h2>
          <p>
            Usamos cookies para mejorar tu experiencia.
          </p>

          <h3>Tipos de Cookies:</h3>
          <ul>
            <li><strong>Esenciales:</strong> Necesarias para funcionar (sesión, autenticación)</li>
            <li><strong>Preferencias:</strong> Recordar idioma, tema, ajustes</li>
            <li><strong>Analítica:</strong> Entender cómo usas el sitio</li>
            <li><strong>Marketing:</strong> Mostrar anuncios personalizados (opcional)</li>
          </ul>

          <h3>Tu Control:</h3>
          <p>
            Puedes controlar cookies a través de:
          </p>
          <ul>
            <li>Configuración de tu navegador (eliminar, bloquear)</li>
            <li>Panel de consentimiento en nuestro sitio</li>
            <li>Opt-out de analítica: [link a herramienta opt-out]</li>
          </ul>

          <p>
            <strong>Nota:</strong> Bloquear cookies esenciales puede afectar funcionalidad del sitio.
          </p>
        </section>

        <section className="legal-section">
          <h2>8. Tus Derechos</h2>
          <p>
            Dependiendo de tu jurisdicción, tienes derechos como:
          </p>

          <h3>Acceso y Control:</h3>
          <ul>
            <li>✅ <strong>Derecho de Acceso:</strong> Ver qué datos tenemos sobre ti</li>
            <li>✅ <strong>Derecho de Corrección:</strong> Actualizar información incorrecta</li>
            <li>✅ <strong>Derecho de Eliminación:</strong> Solicitar borrar tus datos ("derecho al olvido")</li>
            <li>✅ <strong>Derecho de Portabilidad:</strong> Obtener tus datos en formato transferible</li>
            <li>✅ <strong>Derecho de Oposición:</strong> Rechazar procesamiento de datos</li>
            <li>✅ <strong>Derecho a Revocar Consentimiento:</strong> En cualquier momento</li>
          </ul>

          <h3>Cómo Ejercer Derechos:</h3>
          <p>
            Contáctanos en privacy@jonmangas.com con:
          </p>
          <ul>
            <li>Tu email registrado</li>
            <li>Descripción del derecho que deseas ejercer</li>
            <li>Documentación de identidad (puede ser requerida)</li>
          </ul>

          <p>
            Responderemos dentro de 30 días. Si tu solicitud es compleja, podemos extender 
            el plazo a 60 días.
          </p>
        </section>

        <section className="legal-section">
          <h2>9. Nivel de Privacidad</h2>
          <p>
            jonMangas implementa un nivel de privacidad <strong>ALTO</strong> basado en:
          </p>

          <div className="privacy-level">
            <h3>🛡️ Características de Privacidad Implementadas:</h3>
            <ul>
              <li>✅ Encriptación end-to-end para datos sensibles</li>
              <li>✅ No compartimos datos con anunciantes o brokers</li>
              <li>✅ Auditorías de seguridad trimestrales</li>
              <li>✅ Cumplimiento con GDPR y leyes similares</li>
              <li>✅ Política de retención mínima de datos</li>
              <li>✅ Transparencia en procesamiento de datos</li>
              <li>✅ Usuario tiene control total sobre sus datos</li>
              <li>✅ Sin seguimiento entre sitios sin consentimiento</li>
            </ul>
          </div>

          <div className="privacy-level warning">
            <h3>⚠️ Limitaciones a Conocer:</h3>
            <ul>
              <li>Recopilamos dirección IP para prevenir fraude</li>
              <li>Usamos Google Analytics (datos anónimos)</li>
              <li>Procesadores de pago tienen acceso a información de tarjeta</li>
              <li>Retenemos datos 7 años por requisitos legales</li>
            </ul>
          </div>
        </section>

        <section className="legal-section">
          <h2>10. Marketing y Comunicaciones</h2>
          <p>
            Podemos enviarte:
          </p>
          <ul>
            <li><strong>Esencial:</strong> Confirmaciones de pedidos, cambios en cuenta</li>
            <li><strong>Opcional:</strong> Ofertas personalizadas, novedades (puedes desuscribirse)</li>
          </ul>

          <h3>Cómo Controlar Comunicaciones:</h3>
          <ul>
            <li>Link "Desuscribir" en cada email</li>
            <li>Panel de preferencias en tu cuenta</li>
            <li>Contactar a privacy@jonmangas.com</li>
          </ul>

          <p>
            Respetamos tu privacidad y no enviaremos spam. Máximo 2 emails de marketing por semana.
          </p>
        </section>

        <section className="legal-section">
          <h2>11. Datos de Menores</h2>
          <p>
            jonMangas NO recopila información de forma deliberada de menores de 13 años. 
            Si descubrimos que hemos recopilado datos de un menor, eliminaremos esa 
            información inmediatamente.
          </p>
          <p>
            Para usuarios entre 13-18 años:
          </p>
          <ul>
            <li>Requerimos consentimiento parental</li>
            <li>Limitamos recopilación de datos</li>
            <li>No permitimos marketing directo</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>12. Transferencias Internacionales</h2>
          <p>
            Si tu información se transfiere a otros países, implementamos salvaguardas:
          </p>
          <ul>
            <li>Cláusulas contractuales tipo en la UE</li>
            <li>Certificaciones de privacidad internacionales</li>
            <li>Cumplimiento con leyes del país destino</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>13. Cambios a Esta Política</h2>
          <p>
            Podemos actualizar esta Política de Privacidad en cualquier momento. 
            Los cambios entran en vigor cuando se publican.
          </p>
          <p>
            Para cambios materiales significativos, te notificaremos por:
          </p>
          <ul>
            <li>Email a tu dirección registrada</li>
            <li>Aviso prominente en el sitio</li>
            <li>Solicitando consentimiento si es requerido</li>
          </ul>
          <p>
            Tu uso continuado del sitio constituye aceptación de los cambios.
          </p>
        </section>

        <section className="legal-section">
          <h2>14. Privacidad en Redes Sociales</h2>
          <p>
            Si conectas tu cuenta de jonMangas con redes sociales:
          </p>
          <ul>
            <li>Solo solicitamos permisos necesarios</li>
            <li>Puedes desconectar en cualquier momento</li>
            <li>Tus datos en redes sociales están regidos por su política</li>
            <li>No compartimos tus datos de jonMangas con redes sociales</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>15. Derechos de Autor de Contenido</h2>
          <p>
            Los mangas y libros en jonMangas son propiedad intelectual de sus respectivos 
            propietarios. Tu información de lectura (qué compraste) no es compartida 
            con editores sin consentimiento.
          </p>
        </section>

        <section className="legal-section">
          <h2>16. Contacto</h2>
          <p>
            Para preguntas sobre privacidad, contáctanos:
          </p>
          <ul>
            <li><strong>Email de Privacidad:</strong> privacy@jonmangas.com</li>
            <li><strong>Email de Datos Personales:</strong> data@jonmangas.com</li>
            <li><strong>Dirección:</strong> [Tu Dirección Física]</li>
            <li><strong>Teléfono:</strong> +[Tu Número]</li>
          </ul>

          <p>
            También tienes derecho a presentar una reclamación ante las autoridades 
            de protección de datos locales si crees que tus derechos han sido violados.
          </p>
        </section>

        <section className="legal-section">
          <h2>17. Responsable de Datos</h2>
          <p>
            El responsable de datos es:
          </p>
          <ul>
            <li><strong>Entidad:</strong> jonMangas</li>
            <li><strong>Email:</strong> privacy@jonmangas.com</li>
            <li><strong>Sitio:</strong> www.jonmangas.com</li>
          </ul>

          <p>
            Tenemos un Delegado de Protección de Datos disponible para consultas 
            sobre privacidad.
          </p>
        </section>

        <section className="legal-section legal-footer">
          <p>
            Apreciamos tu confianza. Tu privacidad es fundamental para nosotros, 
            y nos comprometemos a protegerla.
          </p>
          <p>
            <strong>Última revisión:</strong> 30 de enero de 2026
          </p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
