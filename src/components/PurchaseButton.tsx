"use client"

import { useUser } from "@clerk/nextjs"
import { Id } from "../../convex/_generated/dataModel"
import { useAction, useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Button } from "./ui/button"
import { Loader2Icon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"



function PurchaseButton(
    { courseId }: { courseId: Id<"courese"> }
) {
    const { user, isLoaded } = useUser()
    const userData = useQuery(api.users.getUserByClerkId, user ? { clerkId: user?.id } : "skip")
    const [isLoading, setIsLoading] = useState(false)
    const createCheckoutSession = useAction(api.stripe.createCheckoutSession)

    const userAccess = useQuery(api.users.getUserAccess, userData ? {
        userId: userData._id,
        courseId: courseId
    } : "skip") || { hasAccess: false }

    const handlePurchase = async () => {
        if (!user) return toast.error("Please log in to purchase the course.")

        setIsLoading(true)
        try {
            const { checkoutUrl } = await createCheckoutSession({ courseId: courseId })

            if (checkoutUrl) {
                window.location.href = checkoutUrl
            } else {
                throw new Error("Checkout URL not found.")
            }
        } catch (error: any) {
            if (error.message.includes("Rate limit exceeded")) {
                toast.error("You have exceeded the purchase limit. Please try again later.")
            } else {
                toast.error("An error occurred while processing your purchase. Please try again.")
            }
        } finally {
            setIsLoading(false)
        }
    }

    if (!userAccess.hasAccess) {
        return <Button variant={"outline"} onClick={handlePurchase} disabled={isLoading}>
            Enroll Now
        </Button>
    }

    if (userAccess.hasAccess) {
        return <Button variant={"outline"}>
            Enrolled
        </Button>
    }

    if (isLoading) {
        return <Button>
            <Loader2Icon className="mr-2 size-4 animate-spin" />
            Loading...
        </Button>
    }
}

export default PurchaseButton