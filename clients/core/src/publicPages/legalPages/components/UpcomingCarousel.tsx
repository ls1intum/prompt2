import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselApi } from "@/components/ui/carousel"
import { useState, useEffect } from 'react'

export function UpcomingCarousel() {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);

    const carouselItems = [
        {
            title: 'Grading',
            description: (
                <>
                    <p>
                        In project-based learning, assessment processes are crucial for evaluating student performance and providing
                        actionable feedback that fosters meaningful learning. However, current methods often fall short in key areas
                        such as standardization, scalability, and tool support. This results in inefficiencies and inequalities,
                        particularly in managing feedback workflows and ensuring fair evaluations in collaborative projects.
                    </p>
                    <p>
                        Specific challenges include subjectivity and inconsistency in grading, limited scalability of manual feedback
                        processes, inefficient data utilization, and lack of automation.
                        These issues create a pressing need for a standardized, tool-supported assessment approach that integrates
                        advanced technology, such as Large Language Models (LLMs), to streamline grading and feedback processes in
                        project-based courses. By addressing these gaps, we aim to enhance fairness, efficiency, and the overall
                        educational experience.
                    </p>
                </>
            ),
        },
        {
            title: 'Templating and Task Management',
            description: (
                <>
                    <p>
                        Managing project-based team courses can be complex and time-consuming.
                        PROMPT is evolving to address these challenges by introducing two essential functionalities:
                        Course Templating and Task Management. The Course Templating feature simplifies and accelerates course
                        configuration by allowing educators to create and manage templates for entire courses or specific phases,
                        enabling the reuse of configurations to minimize redundant setup efforts and reduce errors.
                        Meanwhile, the Task Management feature provides a structured approach to handling tasks within course phases
                        by standardizing task management, supporting absolute and relative due dates, and allowing tasks to be assigned
                        to individuals or groups for clear accountability. These enhancements will streamline course administration,
                        improve efficiency, and reduce the overall management burden for educators.
                    </p>
                </>
            ),
        },
    ];

    useEffect(() => {
        if (!api) {
            return;
        }

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap() + 1);

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1);
        });
    }, [api]);

    return (
        <Carousel setApi={setApi}>
            <CarouselPrevious />
            <CarouselContent>
                {carouselItems.map((item, index) => (
                    <CarouselItem>
                        <Card className='p-4'>
                            <CardTitle className='mb-3'>{item.title}</CardTitle>
                            <CardDescription>{item.description}</CardDescription>
                        </Card>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselNext />
            <div className="flex justify-center mt-4">
                {Array.from({ length: count }).map((_, index) => (
                    <span
                        key={index}
                        className={`inline-block w-3 h-3 rounded-full bg-gray-400 mx-2 ${index + 1 === current ? "bg-[#FF407D]" : ""}`}
                        onClick={() => api && api.scrollTo(index)}
                    />
                ))}
            </div>
        </Carousel>
    )
}