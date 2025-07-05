"use client"
import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import React from 'react'
import { api } from '../../../../convex/_generated/api'
import { Id } from '../../../../convex/_generated/dataModel'
import CourseDetailSkeleton from '@/components/CourseDetailSkeleton'
import { notFound, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { Download, FileText, FileTextIcon, Lock, PlayCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PurchaseButton from '@/components/PurchaseButton'

function page() {

    const { user, isLoaded: isUserLoaded } = useUser()
    const params = useParams()
    const courseId = params?.courseId as Id<"courese">

    const userData = useQuery(api.users.getUserByClerkId, { clerkId: user?.id ?? "" })
    const courseData = useQuery(api.courese.getCouresById, { id: courseId ?? "" })

    const userAccess = useQuery(api.users.getUserAccess, userData ? {
        userId: userData._id,
        courseId: courseId
    } : "skip") || { hasAccess: false }


    if (courseData === null) return notFound()

    if (!isUserLoaded || courseData === undefined) {
        return <CourseDetailSkeleton />
    }
    return (
        <div className='container mx-auto py-8 px-4'>
            <Card className='max-w-4xl mx-auto'>
                <CardHeader>
                    <Image
                        src={courseData.imageUrl}
                        alt={courseData.title}
                        width={1200}
                        height={600}
                        className='rounded-md object-cover w-full'
                    />
                </CardHeader>
                <CardContent>
                    <CardTitle className='text-3xl mb-4'>{courseData.title}</CardTitle>
                </CardContent>
                {userAccess.hasAccess ? (
                    <>
                        <p className='text-gray-600 mb-6'>{courseData.description}</p>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-8'>
                            <Button className='flex items-center justify-center space-x-2'>
                                <PlayCircle className='w-5 h-5' />
                                <span>Start Course</span>
                            </Button>
                            <Button variant='outline' className='flex items-center justify-center space-x-2'>
                                <Download className='w-5 h-5' />
                                <span>Download Materials</span>
                            </Button>
                        </div>
                        <h3 className='text-xl font-semibold mb-4'>Course Modules</h3>
                        <ul className='space-y-2'>
                            <li className='flex items-center space-x-2'>
                                <FileTextIcon className='size-5 text-gray-400' />
                                <span>Introduction to Advanced Patterns</span>
                            </li>
                            <li className='flex items-center space-x-2'>
                                <FileText className='w-5 h-5 text-gray-400' />
                                <span>Hooks and Custom Hooks</span>
                            </li>
                        </ul>
                    </>
                ) : (
                    <div className='text-center'>
                        <div className='flex flex-col items-center space-y-4'>
                            <Lock className='w-16 h-16 text-gray-400' />
                            <p className='text-lg text-gray-600'>This course is locked.</p>
                            <p className='text-gray-500 mb-4'>
                                Enroll in this course to access all premium content.
                            </p>
                            <p className='text-2xl font-bold mb-4'>${courseData.price.toFixed(2)}</p>
                            <PurchaseButton courseId={courseId} />
                        </div>
                    </div>
                )}
            </Card>
        </div>
    )
}

export default page