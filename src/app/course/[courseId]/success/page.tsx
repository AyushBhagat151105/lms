'use client'

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useWindowSize } from 'react-use';
import Confetti from 'react-confetti';

function Page() {
    const params = useParams();
    const searchParams = useSearchParams();
    const courseId = params?.courseId;
    const sessionId = searchParams.get('session_id');

    const { width, height } = useWindowSize();
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        setShowConfetti(true);
        const timer = setTimeout(() => {
            setShowConfetti(false);
        }, 10000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            {showConfetti && (
                <Confetti width={width} height={height} />
            )}

            <div className='container mx-auto py-12 px-4'>
                <Card className='max-w-2xl mx-auto'>
                    <CardHeader className='text-center'>
                        <CheckCircle className='size-16 text-green-500 mx-auto mb-4' />
                        <CardTitle className='text-3xl font-bold text-green-700'>
                            Purchase Successful!
                        </CardTitle>
                    </CardHeader>

                    <CardContent className='text-center space-y-6'>
                        <p className='text-xl text-gray-600'>
                            Thank you for enrolling in our course. Your journey to new skills and knowledge begins now!
                        </p>

                        <div className='bg-gray-100 p-4 rounded-md'>
                            <p className='text-sm text-gray-500'>Transaction ID: {sessionId}</p>
                        </div>

                        <div className='flex justify-center gap-4'>
                            <Link href={`/courses/${courseId}`}>
                                <Button className='w-full sm:w-auto flex items-center justify-center'>
                                    Go to Course
                                </Button>
                            </Link>
                            <Link href='/course'>
                                <Button variant='outline' className='w-full sm:w-auto'>
                                    Browse More Courses
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

export default Page;
