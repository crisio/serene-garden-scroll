import { useState } from "react";
import { Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmergencyDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyDialog = ({ isOpen, onClose }: EmergencyDialogProps) => {
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    lugarResidencia: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Aquí se enviaría al vendedor de turno
    // Por ahora, redirigimos a WhatsApp con la información
    const mensaje = `🚨 EMERGENCIA%0A%0ANombre: ${formData.nombre}%0ATeléfono: ${formData.telefono}%0ALugar de Residencia: ${formData.lugarResidencia}`;
    const numeroVendedor = "50422345678"; // Este número debería venir del sistema de turnos

    window.open(`https://wa.me/${numeroVendedor}?text=${mensaje}`, "_blank");

    // Limpiar formulario y cerrar
    setFormData({ nombre: "", telefono: "", lugarResidencia: "" });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-destructive flex items-center gap-2">
            <Phone className="w-6 h-6" />
            Necesidad Inmediata
          </DialogTitle>
          <DialogDescription className="text-base">
            Complete este formulario y nos pondremos en contacto con usted de inmediato.
            Nuestro equipo está disponible 24/7.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-base font-semibold">
              Nombre Completo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nombre"
              name="nombre"
              type="text"
              required
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ingrese su nombre completo"
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono" className="text-base font-semibold">
              Teléfono <span className="text-destructive">*</span>
            </Label>
            <Input
              id="telefono"
              name="telefono"
              type="tel"
              required
              value={formData.telefono}
              onChange={handleChange}
              placeholder="Ej: 9999-9999"
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lugarResidencia" className="text-base font-semibold">
              Lugar de Residencia <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lugarResidencia"
              name="lugarResidencia"
              type="text"
              required
              value={formData.lugarResidencia}
              onChange={handleChange}
              placeholder="Ciudad, Barrio/Colonia"
              className="h-12 text-base"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 text-base"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 text-base bg-destructive hover:bg-destructive/90 text-white"
            >
              <Phone className="w-4 h-4 mr-2" />
              Contactar Ahora
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Al enviar este formulario, un miembro de nuestro equipo se comunicará con usted inmediatamente.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};
