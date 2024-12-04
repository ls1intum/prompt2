import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Section } from './components/Section'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export default function ImprintPage() {
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className='container mx-auto py-8 px-4'>
      <Card className='w-full max-w-4xl mx-auto'>
        <CardHeader className='relative'>
          <Button
            variant='ghost'
            size='icon'
            className='absolute left-4 top-4'
            onClick={() => navigate('/')}
            aria-label='Go back'
          >
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <CardTitle className='text-3xl font-bold text-center'>Imprint</CardTitle>
          <CardDescription className='text-center'>
            Legal information and disclaimers
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <Section title='Publisher'>
            <p>Technical University of Munich</p>
            <p>Postal address: Arcisstrasse 21, 80333 Munich</p>
            <p>Telephone: +49-(0)89-289-01</p>
            <p>Fax: +49-(0)89-289-22000</p>
            <p>Email: poststelle(at)tum.de</p>
          </Section>

          <Section title='Authorized to represent'>
            <p>
              The Technical University of Munich is legally represented by the President Prof. Dr.
              Thomas F. Hofmann.
            </p>
          </Section>

          <Section title='VAT identification number'>
            <p>DE811193231 (in accordance with § 27a of the German VAT tax act - UStG)</p>
          </Section>

          <Section title='Responsible for content'>
            <p>Prof. Dr. Stephan Krusche</p>
            <p>Boltzmannstrasse 3</p>
            <p>85748 Garching</p>
          </Section>

          <Section title='Terms of use'>
            <p>
              Texts, images, graphics as well as the design of these Internet pages may be subject
              to copyright. The following are not protected by copyright according to §5 of
              copyright law (Urheberrechtsgesetz (UrhG)).
            </p>
            <p>
              Laws, ordinances, official decrees and announcements as well as decisions and
              officially written guidelines for decisions and other official works that have been
              published in the official interest for general knowledge, with the restriction that
              the provisions on prohibition of modification and indication of source in Section 62
              (1) to (3) and Section 63 (1) and (2) UrhG apply accordingly.
            </p>
            <p>
              As a private individual, you may use copyrighted material for private and other
              personal use within the scope of Section 53 UrhG. Any duplication or use of objects
              such as images, diagrams, sounds or texts in other electronic or printed publications
              is not permitted without our agreement. This consent will be granted upon request by
              the person responsible for the content. The reprinting and evaluation of press
              releases and speeches are generally permitted with reference to the source.
              Furthermore, texts, images, graphics and other files may be subject in whole or in
              part to the copyright of third parties. The persons responsible for the content will
              also provide more detailed information on the existence of possible third-party
              rights.
            </p>
          </Section>

          <Section title='Liability disclaimer'>
            <p>
              The information provided on this website has been collected and verified to the best
              of our knowledge and belief. However, there will be no warranty that the information
              provided is up-to-date, correct, complete, and available. There is no contractual
              relationship with users of this website.
            </p>
            <p>
              We accept no liability for any loss or damage caused by using this website. The
              exclusion of liability does not apply where the provisions of the German Civil Code
              (BGB) on liability in case of breach of official duty are applicable (§ 839 of the
              BGB). We accept no liability for any loss or damage caused by malware when accessing
              or downloading data or the installation or use of software from this website.
            </p>
            <p>
              Where necessary in individual cases: the exclusion of liability does not apply to
              information governed by the Directive 2006/123/EC of the European Parliament and of
              the Council. This information is guaranteed to be accurate and up to date.
            </p>
          </Section>

          <Section title='Links'>
            <p>
              Our own content is to be distinguished from cross-references (&quot;links&quot;) to
              websites of other providers. These links only provide access for using third-party
              content in accordance with § 8 of the German telemedia act (TMG). Prior to providing
              links to other websites, we review third-party content for potential civil or criminal
              liability. However, a continuous review of third-party content for changes is not
              possible, and therefore we cannot accept any responsibility. For illegal, incorrect,
              or incomplete content, including any damage arising from the use or non-use of
              third-party information, liability rests solely with the provider of the website.
            </p>
          </Section>
        </CardContent>
      </Card>
    </div>
  )
}
