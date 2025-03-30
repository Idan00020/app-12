import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const cage = await prisma.cage.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!cage) {
      return NextResponse.json({ error: 'Cage not found' }, { status: 404 });
    }
    
    return NextResponse.json(cage);
  } catch (error) {
    console.error('Error fetching cage:', error);
    return NextResponse.json({ error: 'Failed to fetch cage' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
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

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    await prisma.cage.delete({
      where: { id: parseInt(id) }
    });
    
    return NextResponse.json({ message: 'Cage deleted successfully' });
  } catch (error) {
    console.error('Error deleting cage:', error);
    return NextResponse.json({ error: 'Failed to delete cage' }, { status: 500 });
  }
}
