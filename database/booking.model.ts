import { HydratedDocument, Model, Schema, Types, model, models } from "mongoose"

import { Event } from "./event.model"

export interface BookingDocument {
  eventId: Types.ObjectId
  email: string
  createdAt: Date
  updatedAt: Date
}

type BookingModel = Model<BookingDocument>

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const bookingSchema = new Schema<BookingDocument>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string) => EMAIL_REGEX.test(value),
        message: "email must be a valid email address.",
      },
    },
  },
  { timestamps: true }
)

// Index by event for quick booking lookups by event id.
bookingSchema.index({ eventId: 1 })

bookingSchema.pre("save", async function (next) {
  try {
    this.email = this.email.trim().toLowerCase()
    if (!EMAIL_REGEX.test(this.email)) {
      throw new Error("email must be a valid email address.")
    }

    // Ensure the booking always points to an existing event document.
    if (this.isNew || this.isModified("eventId")) {
      const eventExists = await Event.exists({ _id: this.eventId })
      if (!eventExists) {
        throw new Error("Referenced event does not exist.")
      }
    }

    next()
  } catch (error) {
    next(error as Error)
  }
})

export const Booking =
  (models.Booking as BookingModel | undefined) ??
  model<BookingDocument, BookingModel>("Booking", bookingSchema)

export type BookingDoc = HydratedDocument<BookingDocument>
