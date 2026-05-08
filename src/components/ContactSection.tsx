import { Phone, Mail, MapPin, Clock, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect, type FormEvent } from "react";
import {
  fetchContactSection,
  sendContactEmail,
  type ContactSectionData,
  type ContactEmailPayload,
} from "@/lib/strapi";
import memorialInterior from "@/assets/memorial-interior.jpg";

// Mapa de iconos disponibles
const iconMap: Record<string, LucideIcon> = {
  Phone,
  Mail,
  MapPin,
  Clock,
};

type ContactFormErrors = Partial<Record<keyof ContactEmailPayload, string>>;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ContactSection = () => {
  const normalizePhone = (value: string) => value.replace(/\D/g, "");
  const [contactData, setContactData] = useState<ContactSectionData>({
    title: "Contáctanos",
    subtitle: "Estamos aquí para apoyarlo cuando más nos necesite. Contáctenos en cualquier momento del día o la noche.",
    contactinfo: [],
    emergencyTitle: "Emergencia 24/7",
    emergencyPhone: "(504) 2234-5678",
    emergencyButtonText: "Llamar Ahora:",
    formTitle: "Envíanos un Mensaje",
    formSubmitButtonText: "Enviar Mensaje",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSucceeded, setIsSucceeded] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ContactFormErrors>({});

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchContactSection();
      console.log("Contact Section Data:", data);
      setContactData(data);
    };
    loadData();
  }, []);

  const backgroundImage = contactData.backgroundImageUrl || memorialInterior;

  const FIELD_LABELS: Record<keyof ContactEmailPayload, string> = {
    nombre_completo: "Nombre completo",
    telefono: "Teléfono",
    email: "Correo electrónico",
    servicio_interes: "Servicio de interés",
    mensaje: "Mensaje",
    website: "Website",
  };

  const validateForm = (payload: ContactEmailPayload): ContactFormErrors => {
    const errors: ContactFormErrors = {};
    const phoneDigits = normalizePhone(payload.telefono || "");
    const allowedServices = new Set([
      "funeral",
      "cemetery",
      "cremation",
      "other",
      "Servicio funerario",
      "Cementerio",
      "Cremacion",
      "Otro",
    ]);

    if (!payload.nombre_completo.trim()) {
      errors.nombre_completo = "Ingrese su nombre completo.";
    }

    if (!payload.telefono.trim()) {
      errors.telefono = "Ingrese un teléfono.";
    } else if (phoneDigits.length < 8) {
      errors.telefono = "Ingrese un teléfono válido.";
    }

    if (!payload.email.trim()) {
      errors.email = "Ingrese su correo electrónico.";
    } else if (!EMAIL_REGEX.test(payload.email)) {
      errors.email = "Ingrese un correo electrónico válido.";
    }

    if (!(payload.servicio_interes || "").trim()) {
      errors.servicio_interes = "Seleccione el servicio de su interés.";
    } else if (!allowedServices.has(payload.servicio_interes)) {
      errors.servicio_interes = "Seleccione un servicio válido.";
    }

    if (!(payload.mensaje || "").trim()) {
      errors.mensaje = "Cuéntenos cómo podemos ayudarle.";
    } else if (payload.mensaje.trim().length < 10) {
      errors.mensaje = "El mensaje debe tener al menos 10 caracteres.";
    } else if (payload.mensaje.length > 2000) {
      errors.mensaje = "El mensaje es demasiado largo (máximo 2000 caracteres).";
    }

    return errors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const nombreCompleto = String(formData.get("nombre_completo") || "").trim();
    const telefono = String(formData.get("telefono") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const rawServicioInteres = String(formData.get("servicio_interes") || "").trim();
    const mensaje = String(formData.get("mensaje") || "").trim();
    const website = String(formData.get("website") || "").trim();
    const serviceLabelMap: Record<string, string> = {
      funeral: "Servicio funerario",
      cemetery: "Cementerio",
      cremation: "Cremacion",
      other: "Otro",
    };
    const servicioInteres = serviceLabelMap[rawServicioInteres] || rawServicioInteres;

    const payload: ContactEmailPayload = {
      nombre_completo: nombreCompleto,
      telefono,
      email,
      servicio_interes: servicioInteres,
      mensaje,
      website,
    };

    const validationErrors = validateForm(payload);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      // No es un error del servidor: dejamos submitError en null para mostrar
      // solo la alerta amarilla con la lista de campos faltantes.
      setSubmitError(null);
      setIsSucceeded(false);
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});
    setSubmitError(null);
    setIsSucceeded(false);

    try {
      await sendContactEmail(payload);
      setIsSucceeded(true);
      form.reset();
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No se pudo enviar el mensaje. Intente nuevamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section 
      id="contact" 
      className="py-20 parallax-section relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${backgroundImage})`
      }}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {contactData.title}
            </h2>
            <div className="w-24 h-1 bg-primary-gold mx-auto mb-8"></div>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              {contactData.subtitle}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8 slide-up">
              <h3 className="text-3xl font-bold text-white mb-8">
                Información de Contacto
              </h3>
              
              <div className="grid gap-6">
                {contactData.contactinfo.map((item, index) => {
                  const IconComponent = iconMap[item.icon] || Phone;
                  return (
                    <Card 
                      key={item.id}
                      className="bg-white/10 backdrop-blur-sm border-white/20 fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CardContent className="p-3 sm:p-4 md:p-6 flex items-center gap-2 sm:gap-3 md:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-primary-gold" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-base sm:text-lg font-semibold text-white mb-1">
                            {item.title}
                          </h4>
                          <p className="text-sm sm:text-base text-primary-gold font-medium mb-1 break-words">
                            {item.info}
                          </p>
                          <p className="text-white/70 text-xs sm:text-sm break-words">
                            {item.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Emergency Call Button */}
              <Card className="bg-primary-green border-primary-green slide-up">
                <CardContent className="p-3 sm:p-4 md:p-6 text-center">
                  <h4 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">
                    {contactData.emergencyTitle}
                  </h4>
                  <Button 
                    size="lg"
                    className="bg-white text-primary-green hover:bg-white/90 font-bold px-4 sm:px-6 md:px-8 py-3 sm:py-4 text-sm sm:text-base md:text-lg w-full"
                    onClick={() => window.location.href = `tel:${normalizePhone(contactData.emergencyPhone)}`}
                  >
                    {contactData.emergencyButtonText} {contactData.emergencyPhone}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="slide-up">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-3 sm:p-4 md:p-6 lg:p-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8">
                    {contactData.formTitle}
                  </h3>
                  
                  {isSucceeded && (
                    <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-6 text-green-100">
                      <p className="font-semibold">¡Mensaje enviado con éxito!</p>
                      <p className="text-sm mt-1">Gracias por contactarnos. Te responderemos pronto.</p>
                    </div>
                  )}

                  {Object.keys(fieldErrors).length > 0 && (
                    <div
                      role="alert"
                      className="bg-yellow-400/20 border border-yellow-400 rounded-lg p-4 mb-6 text-yellow-50"
                    >
                      <p className="font-semibold">Antes de enviar, completa lo que te falta:</p>
                      <ul className="text-sm mt-2 list-disc list-inside space-y-1">
                        {(Object.entries(fieldErrors) as Array<[keyof ContactEmailPayload, string]>).map(
                          ([field, msg]) => (
                            <li key={field}>
                              <span className="font-medium">{FIELD_LABELS[field]}:</span> {msg}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {submitError && (
                    <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6 text-red-100">
                      <p className="font-semibold">No se pudo enviar el mensaje</p>
                      <p className="text-sm mt-1">{submitError}</p>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} noValidate className="space-y-6">
                    <div className="hidden" aria-hidden="true">
                      <label htmlFor="website">Sitio web</label>
                      <input id="website" name="website" type="text" autoComplete="off" tabIndex={-1} />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="nombre" className="block text-white/90 text-sm font-medium mb-2">
                          Nombre Completo
                        </label>
                        <Input 
                          id="nombre"
                          name="nombre_completo"
                          required
                          placeholder="Su nombre"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        />
                        {fieldErrors.nombre_completo && (
                          <p className="text-yellow-200 text-xs mt-1">{fieldErrors.nombre_completo}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="telefono" className="block text-white/90 text-sm font-medium mb-2">
                          Teléfono
                        </label>
                        <Input 
                          id="telefono"
                          name="telefono"
                          type="tel"
                          required
                          placeholder="Su teléfono"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        />
                        {fieldErrors.telefono && (
                          <p className="text-yellow-200 text-xs mt-1">{fieldErrors.telefono}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-white/90 text-sm font-medium mb-2">
                        Correo Electrónico
                      </label>
                      <Input 
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="su@email.com"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                      {fieldErrors.email && (
                        <p className="text-yellow-200 text-xs mt-1">{fieldErrors.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="servicio" className="block text-white/90 text-sm font-medium mb-2">
                        Servicio de Interés
                      </label>
                      <select
                        id="servicio"
                        name="servicio_interes"
                        required
                        defaultValue=""
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
                      >
                        <option value="" className="text-gray-800">Seleccione un servicio</option>
                        <option value="funeral" className="text-gray-800">Servicios Funerarios</option>
                        <option value="cemetery" className="text-gray-800">Cementerio</option>
                        <option value="cremation" className="text-gray-800">Cremación</option>
                        <option value="other" className="text-gray-800">Otro</option>
                      </select>
                      {fieldErrors.servicio_interes && (
                        <p className="text-yellow-200 text-xs mt-1">{fieldErrors.servicio_interes}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="mensaje" className="block text-white/90 text-sm font-medium mb-2">
                        Mensaje
                      </label>
                      <Textarea
                        id="mensaje"
                        name="mensaje"
                        required
                        minLength={10}
                        maxLength={2000}
                        placeholder="Cuéntenos cómo podemos ayudarle (mínimo 10 caracteres)"
                        rows={4}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                      {fieldErrors.mensaje && (
                        <p className="text-yellow-200 text-xs mt-1">{fieldErrors.mensaje}</p>
                      )}
                    </div>
                    
                    <Button 
                      type="submit"
                      disabled={isSubmitting}
                      size="lg"
                      className="w-full bg-primary-gold hover:bg-primary-gold/90 text-white font-semibold py-4"
                    >
                      {isSubmitting ? "Enviando..." : contactData.formSubmitButtonText}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};