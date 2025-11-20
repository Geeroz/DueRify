import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { calculateOverallScore, normalizeScore, generateRecommendations } from '@/lib/assessment-questions'

const createSchema = z.object({
  startupId: z.string().min(1),
  dimension: z.enum(['TRL', 'MRL', 'CRL', 'BRL']),
  level: z.number().int().positive(),
  data: z.any().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startupId = searchParams.get('startupId')

    if (!startupId) {
      return NextResponse.json({ error: 'Startup ID is required' }, { status: 400 })
    }

    // Check user has access to this startup
    const userStartup = await prisma.startupUser.findFirst({
      where: {
        userId: session.user.id,
        startupId,
      },
    })

    if (!userStartup) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get latest assessment for this startup
    const assessment = await prisma.assessment.findFirst({
      where: { startupId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: assessment })
  } catch (error) {
    console.error('Assessment fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch assessment' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = createSchema.parse(body)

    // Check user has access
    const userStartup = await prisma.startupUser.findFirst({
      where: {
        userId: session.user.id,
        startupId: validated.startupId,
      },
    })

    if (!userStartup) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get or create assessment
    let assessment = await prisma.assessment.findFirst({
      where: { startupId: validated.startupId },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate normalized score based on dimension
    let normalizedScore: number
    switch (validated.dimension) {
      case 'TRL':
        normalizedScore = normalizeScore(validated.level, 9)
        break
      case 'MRL':
        normalizedScore = normalizeScore(validated.level, 10)
        break
      case 'CRL':
        normalizedScore = normalizeScore(validated.level, 6)
        break
      case 'BRL':
        normalizedScore = normalizeScore(validated.level, 10)
        break
    }

    if (assessment) {
      // Update existing assessment
      const updateData: any = {}

      switch (validated.dimension) {
        case 'TRL':
          updateData.trlScore = normalizedScore
          updateData.trlData = validated.data || { level: validated.level }
          break
        case 'MRL':
          updateData.mrlScore = normalizedScore
          updateData.mrlData = validated.data || { level: validated.level }
          break
        case 'CRL':
          updateData.crlScore = normalizedScore
          updateData.crlData = validated.data || { level: validated.level }
          break
        case 'BRL':
          updateData.brlScore = normalizedScore
          updateData.brlData = validated.data || { level: validated.level }
          break
      }

      assessment = await prisma.assessment.update({
        where: { id: assessment.id },
        data: updateData,
      })

      // Recalculate overall score
      const overallScore = calculateOverallScore(
        assessment.trlScore,
        assessment.mrlScore,
        assessment.crlScore,
        assessment.brlScore
      )

      // Generate recommendations
      const recommendations = generateRecommendations({
        trlScore: assessment.trlScore,
        mrlScore: assessment.mrlScore,
        crlScore: assessment.crlScore,
        brlScore: assessment.brlScore,
      })

      // Check if all dimensions are completed
      const isComplete =
        assessment.trlScore !== null &&
        assessment.mrlScore !== null &&
        assessment.crlScore !== null &&
        assessment.brlScore !== null

      assessment = await prisma.assessment.update({
        where: { id: assessment.id },
        data: {
          overallScore,
          recommendations,
          completedAt: isComplete ? new Date() : null,
        },
      })
    } else {
      // Create new assessment
      const createData: any = {
        startupId: validated.startupId,
      }

      switch (validated.dimension) {
        case 'TRL':
          createData.trlScore = normalizedScore
          createData.trlData = validated.data || { level: validated.level }
          break
        case 'MRL':
          createData.mrlScore = normalizedScore
          createData.mrlData = validated.data || { level: validated.level }
          break
        case 'CRL':
          createData.crlScore = normalizedScore
          createData.crlData = validated.data || { level: validated.level }
          break
        case 'BRL':
          createData.brlScore = normalizedScore
          createData.brlData = validated.data || { level: validated.level }
          break
      }

      createData.overallScore = normalizedScore
      createData.recommendations = generateRecommendations(createData)

      assessment = await prisma.assessment.create({
        data: createData,
      })
    }

    return NextResponse.json({ data: assessment })
  } catch (error) {
    console.error('Assessment save error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Failed to save assessment' }, { status: 500 })
  }
}
