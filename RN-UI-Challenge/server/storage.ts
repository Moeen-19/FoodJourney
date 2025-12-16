import { 
  users, businesses, reservations, itineraries, itineraryDays, itineraryStops,
  budgetTransactions, favorites, sharedItems, friends, activityFeed, cachedData, spendingInsights,
  type User, type InsertUser, type Business, type Reservation, type Itinerary, 
  type ItineraryDay, type ItineraryStop, type BudgetTransaction, type Favorite
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getBusinesses(category?: string, city?: string): Promise<Business[]>;
  getBusinessById(id: string): Promise<Business | undefined>;
  
  createReservation(data: Partial<Reservation>): Promise<Reservation>;
  getReservations(userId: string): Promise<Reservation[]>;
  cancelReservation(id: string): Promise<Reservation | undefined>;
  
  createItinerary(data: Partial<Itinerary>): Promise<Itinerary>;
  getItineraries(userId: string): Promise<Itinerary[]>;
  getItineraryById(id: string): Promise<Itinerary | undefined>;
  getItineraryByShareCode(code: string): Promise<Itinerary | undefined>;
  
  addBudgetTransaction(data: Partial<BudgetTransaction>): Promise<BudgetTransaction>;
  getBudgetHistory(userId: string, days?: number): Promise<BudgetTransaction[]>;
  
  addFavorite(userId: string, businessId: string): Promise<Favorite>;
  removeFavorite(userId: string, businessId: string): Promise<void>;
  getFavorites(userId: string): Promise<Favorite[]>;
  
  getFriends(userId: string): Promise<User[]>;
  addFriend(userId: string, friendId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getBusinesses(category?: string, city?: string): Promise<Business[]> {
    let query = db.select().from(businesses);
    const conditions = [];
    if (category) conditions.push(eq(businesses.category, category));
    if (city) conditions.push(eq(businesses.city, city));
    if (conditions.length > 0) {
      return await db.select().from(businesses).where(and(...conditions));
    }
    return await query;
  }

  async getBusinessById(id: string): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.id, id));
    return business || undefined;
  }

  async createReservation(data: Partial<Reservation>): Promise<Reservation> {
    const confirmationCode = `CW${randomUUID().slice(0, 8).toUpperCase()}`;
    const [reservation] = await db
      .insert(reservations)
      .values({ ...data, confirmationCode, status: 'confirmed' } as any)
      .returning();
    return reservation;
  }

  async getReservations(userId: string): Promise<Reservation[]> {
    return await db.select().from(reservations)
      .where(eq(reservations.userId, userId))
      .orderBy(desc(reservations.date));
  }

  async cancelReservation(id: string): Promise<Reservation | undefined> {
    const [reservation] = await db
      .update(reservations)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(reservations.id, id))
      .returning();
    return reservation;
  }

  async createItinerary(data: Partial<Itinerary>): Promise<Itinerary> {
    const shareCode = randomUUID().slice(0, 12);
    const [itinerary] = await db
      .insert(itineraries)
      .values({ ...data, shareCode } as any)
      .returning();
    return itinerary;
  }

  async getItineraries(userId: string): Promise<Itinerary[]> {
    return await db.select().from(itineraries)
      .where(eq(itineraries.userId, userId))
      .orderBy(desc(itineraries.createdAt));
  }

  async getItineraryById(id: string): Promise<Itinerary | undefined> {
    const [itinerary] = await db.select().from(itineraries).where(eq(itineraries.id, id));
    return itinerary || undefined;
  }

  async getItineraryByShareCode(code: string): Promise<Itinerary | undefined> {
    const [itinerary] = await db.select().from(itineraries).where(eq(itineraries.shareCode, code));
    return itinerary || undefined;
  }

  async addBudgetTransaction(data: Partial<BudgetTransaction>): Promise<BudgetTransaction> {
    const [transaction] = await db
      .insert(budgetTransactions)
      .values(data as any)
      .returning();
    return transaction;
  }

  async getBudgetHistory(userId: string, days: number = 30): Promise<BudgetTransaction[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return await db.select().from(budgetTransactions)
      .where(and(
        eq(budgetTransactions.userId, userId),
        gte(budgetTransactions.date, startDate)
      ))
      .orderBy(desc(budgetTransactions.date));
  }

  async addFavorite(userId: string, businessId: string): Promise<Favorite> {
    const [favorite] = await db
      .insert(favorites)
      .values({ userId, businessId })
      .returning();
    return favorite;
  }

  async removeFavorite(userId: string, businessId: string): Promise<void> {
    await db.delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.businessId, businessId)));
  }

  async getFavorites(userId: string): Promise<Favorite[]> {
    return await db.select().from(favorites)
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));
  }

  async getFriends(userId: string): Promise<User[]> {
    const friendRows = await db.select().from(friends)
      .where(and(eq(friends.userId, userId), eq(friends.status, 'accepted')));
    
    const friendIds = friendRows.map(f => f.friendId).filter(Boolean) as string[];
    if (friendIds.length === 0) return [];
    
    const friendUsers: User[] = [];
    for (const id of friendIds) {
      const user = await this.getUser(id);
      if (user) friendUsers.push(user);
    }
    return friendUsers;
  }

  async addFriend(userId: string, friendId: string): Promise<void> {
    await db.insert(friends).values({ userId, friendId, status: 'pending' });
  }
}

export const storage = new DatabaseStorage();
