import { Megaphone } from "lucide-react"
import { Card } from "./ui/card"

const Notifications = () => {
  return (
    <Card className="z-1 w-[97vw] mt-2 mb-12 px-3">
        <div className="flex items-start justify-between h-full relative py-1">
            <div className="flex justify-center items-center gap-4 ">
            <Megaphone/>
            <div className="flex flex-col">
                <span className="font-bold text-sm">BOOKING</span>
                <span className="font-medium">Check-in is available now</span>
                <span className="text-sm text-gray-600">Upcoming stay in 2 days</span>
            </div>
            </div>
            <div className="flex flex-col">
                <span className="text-sm text-gray-500">
                    Just now
                </span>
            </div>
        </div>
    </Card>
  )
}

export default Notifications