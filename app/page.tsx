import { Hero } from '@/components/home/Hero'
import { ComoFunciona } from '@/components/home/ComoFunciona'
import { VitrineCatalogo } from '@/components/home/VitrineCatalogo'
import { Comparador } from '@/components/home/Comparador'
import { FAQ } from '@/components/home/FAQ'

export default function HomePage() {
  return (
    <>
      <Hero />
      <ComoFunciona />
      <VitrineCatalogo />
      <Comparador />
      <FAQ />
    </>
  )
}
