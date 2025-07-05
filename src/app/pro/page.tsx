"use client"
import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'

function page() {
    const { user, isLoaded: isUserLoaded } = useUser()

    const userData = useQuery(api.users.getUserByClerkId, user ? { clerkId: user.id } : "skip")

    const userSubscription = useQuery(api.subscriptions.getUserSubscription,
        userData ? { user: userData._id } : "skip"
    )

    const isYearlySubscriptionActive = userSubscription?.status === "active" && userSubscription.planType === "year"

    return (
        <div className='container mx-auto px-4 py-16 max-w-6xl'>
            <h1 className='text-4xl font-bold text-center mb-4 text-gray-800'>Choose Your Pro Journey</h1>
            <p className='text-xl text-center mb-12 text-gray-600'>
                Unlock premium features and accelerate your learning
            </p>
        </div>
    )
}

export default page