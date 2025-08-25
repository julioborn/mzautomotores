"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Phone } from "lucide-react"
import { WhatsAppFloat } from "@/components/whatsapp-float"
import { VehicleExplorer } from "@/components/vehicle-explorer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-slate-50 to-slate-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-4">
            Encontrá tu vehículo ideal
          </h1>
        </div> */}

        <VehicleExplorer />

        {/* CTA */}
        <div className="mt-12 sm:mt-16 text-center">
          <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200 shadow-sm">
            <CardContent className="py-6 sm:py-8 px-4 sm:px-6">
              <h3 className="text-xl sm:text-2xl font-bold text-black mb-3 sm:mb-4">
                ¿No encontraste lo que buscás?
              </h3>
              <p className="text-slate-600 mb-4 sm:mb-6 text-sm sm:text-base">
                Contactanos y te ayudamos a encontrar el vehículo perfecto.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => window.open("https://wa.me/3483529702", "_blank")}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => window.open("tel:+3483529702", "_blank")}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Llamar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <WhatsAppFloat />
    </div>
  )
}
