import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Vehículo no encontrado</h1>
            <p className="text-gray-600 mb-5">Puede que se haya dado de baja o el enlace sea incorrecto.</p>
            <Link href="/" prefetch>
                <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver al catálogo
                </Button>
            </Link>
        </div>
    )
}
