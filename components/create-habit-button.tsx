"use client"

import { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Habit } from "@/types/habit"

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

interface CreateHabitButtonProps {
    onAddHabit: (habit: Habit) => void
    habits: Habit[]
}

const formSchema = z.object({
    name: z.string().min(1, {
        message: "Habit name is required.",
    }),
    frequency: z.string().min(1, {
        message: "Frequency is required.",
    }),
})

export function CreateHabitButton({ onAddHabit, habits }: CreateHabitButtonProps) {
    const [showHabitDialog, setShowHabitDialog] = useState(false)
    const [color, setColor] = useState("green")

    const colorOptions = [
        { className: "bg-green-500", name: "green", label: "Green" },
        { className: "bg-yellow-500", name: "yellow", label: "Yellow" },
        { className: "bg-purple-500", name: "purple", label: "Purple" },
        { className: "bg-red-500", name: "red", label: "Red" },
        { className: "bg-orange-500", name: "orange", label: "Orange" },
    ]

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            frequency: "1",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        const newHabit: Habit = {
            id: uuidv4(),
            name: values.name,
            threshold: Number.parseInt(values.frequency),
            color: color,
            createdAt: new Date().toISOString(),
            completedDates: [],
        }

        onAddHabit(newHabit)
        form.reset()
        setShowHabitDialog(false)
    }

    return (
        <div className="flex justify-center">
            <Dialog open={showHabitDialog} onOpenChange={setShowHabitDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Habit</DialogTitle>
                        <DialogDescription>Enter the name and frequency of your new habit.</DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                            <div className="flex items-center space-x-2">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>Habit Name</FormLabel>
                                            <div className="relative flex items-center">
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <button
                                                            type="button"
                                                            className={`absolute left-3 w-6 h-6 rounded-full bg-${color}-500 flex-shrink-0 cursor-pointer border border-input z-10`}
                                                            aria-label="Select color"
                                                        />
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-2" align="start">
                                                        <div className="flex gap-2">
                                                            {colorOptions.map((option) => (
                                                                <button
                                                                    key={option.name}
                                                                    type="button"
                                                                    className={`w-8 h-8 rounded-full ${option.className} cursor-pointer border ${color === option.name ? "border-primary border-2" : "border-input"}`}
                                                                    onClick={() => setColor(option.name)}
                                                                    aria-label={`Select ${option.label} color`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                                <FormControl>
                                                    <Input {...field} className="pl-12" placeholder="Enter habit name" />
                                                </FormControl>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <FormField
                                    control={form.control}
                                    name="frequency"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>Frequency (days)</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select frequency" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="1">Every day</SelectItem>
                                                    <SelectItem value="2">Every 2 days</SelectItem>
                                                    <SelectItem value="3">Every 3 days</SelectItem>
                                                    <SelectItem value="7">Weekly</SelectItem>
                                                    <SelectItem value="14">Bi-weekly</SelectItem>
                                                    <SelectItem value="30">Monthly</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <DialogFooter className="sm:justify-start">
                                <DialogClose asChild>
                                    <Button className="cursor-pointer" type="button" variant="secondary">
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button className="cursor-pointer" type="submit">Create Habit</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Button className="cursor-pointer" onClick={() => setShowHabitDialog(true)}>
                <Plus />
                Add Habit
            </Button>
        </div>
    )
}

