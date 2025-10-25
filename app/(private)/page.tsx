import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { signout } from '../login/actions'
import Navbar from '@/components/navbar'
import Chat from "@/components/chat"
import ReservationInfo from '@/components/reservation-info'
import Notifications from '@/components/notifications'
import Menu from '@/components/menu'


export default async function Home() {
    const supabase = await createClient()
  
    const { data, error } = await supabase.auth.getUser()
    console.log(data)
    if (error || !data?.user) {
      redirect('/login')
    }

  return (
    <div 
      className="relative h-svh flex flex-col items-center bg-cover bg-center bg-no-repeat "
      style={{
        backgroundImage: "url('/house-bg.png')"
      }}
    >
      {/* Darker overlay for better content readability */}
      <div className="absolute inset-0 bg-black/50"></div>
      
      <div className="w-[80vw] relative p-8 z-10">
        <Navbar />
      </div>
      <ReservationInfo />
      <Notifications/>
      <Menu/>
      
      <div className=" z-3">
        <Chat />
      </div>
    </div>
  );
}
