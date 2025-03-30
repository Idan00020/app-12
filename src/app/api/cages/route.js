import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET() {
  try {
    const cages = await prisma.cage.findMany();
    return NextResponse.json(cages);
  } catch (error) {
    console.error('Error fetching cages:', error);
    return NextResponse.json({ error: 'Failed to fetch cages' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const cage = await prisma.cage.create({
      data
    });
    return NextResponse.json(cage);
  } catch (error) {
    console.error('Error creating cage:', error);
    return NextResponse.json({ error: 'Failed to create cage' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id } = request.nextUrl.searchParams;
    const data = await request.json();
    const cage = await prisma.cage.update({
      where: { id: parseInt(id) },
      data
    });
    return NextResponse.json(cage);
  } catch (error) {
    console.error('Error updating cage:', error);
    return NextResponse.json({ error: 'Failed to update cage' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = request.nextUrl.searchParams;
    await prisma.cage.delete({
      where: { id: parseInt(id) }
    });
    return NextResponse.json({ message: 'Cage deleted successfully' });
  } catch (error) {
    console.error('Error deleting cage:', error);
    return NextResponse.json({ error: 'Failed to delete cage' }, { status: 500 });
  }
}
