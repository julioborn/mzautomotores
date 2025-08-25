"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, X, Phone } from "lucide-react"

export function WhatsAppFloat() {
  const [isOpen, setIsOpen] = useState(false)

  const handleWhatsAppContact = (message?: string) => {
    const defaultMessage = "Hola! Me gustaría obtener más información sobre los vehículos disponibles."
    const finalMessage = message || defaultMessage
    const encodedMessage = encodeURIComponent(finalMessage)
    window.open(`https://wa.me/3483529702?text=${encodedMessage}`, "_blank")
    setIsOpen(false)
  }

  const quickMessages = [
    "Quiero información sobre vehículos disponibles",
    "¿Tienen financiamiento disponible?",
    "Me gustaría agendar una cita para ver un vehículo",
    "¿Aceptan vehículos como parte de pago?",
  ]

  return (
    <>
      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]">
          <Card className="shadow-lg">
            <CardHeader className="bg-green-600 text-white rounded-t-lg">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">¿En qué te podemos ayudar?</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-green-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <p className="text-sm text-gray-600">Selecciona una opción o escríbenos directamente:</p>

              {quickMessages.map((message, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full text-left justify-start h-auto p-3 whitespace-normal bg-transparent"
                  onClick={() => handleWhatsAppContact(message)}
                >
                  {message}
                </Button>
              ))}

              <div className="flex gap-2 pt-2">
                <Button onClick={() => handleWhatsAppContact()} className="flex-1 bg-green-600 hover:bg-green-700">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Abrir WhatsApp
                </Button>
                <Button variant="outline" onClick={() => window.open("tel:+3483529702", "_blank")}>
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 shadow-lg"
        size="sm"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </>
  )
}
