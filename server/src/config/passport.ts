import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import { prisma } from './database';
import { User } from '../types';

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '',
    },
    async (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: User | false) => void) => {
      try {
        // Extract email and googleId from profile
        const email = profile.emails?.[0]?.value;
        const googleId = profile.id;

        // Validate email
        if (!email) {
          return done(new Error('No email provided by Google'), false);
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return done(new Error('Invalid email address provided by Google'), false);
        }

        // Check if user already exists by googleId or email
        let user = await prisma.user.findFirst({
          where: {
            OR: [{ googleId }, { email }],
          },
        });

        if (!user) {
          // Create new user if they don't exist
          user = await prisma.user.create({
            data: {
              googleId, // Store the googleId
              email,
              name: profile.displayName || '',
              phone_number: null, // Optional field
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user || null);
  } catch (error) {
    done(error, null);
  }
});