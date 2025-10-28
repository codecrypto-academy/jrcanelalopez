import { NextResponse } from 'next/server';
import { networkStore } from '@/lib/network-store';
import { ApiResponse } from '@/types/besu';

const BESU_SERVER_URL = process.env.BESU_SERVER_URL || 'http://localhost:3001';

/**
 * POST /api/cleanup - Cleanup all networks
 */
export async function POST(): Promise<NextResponse<ApiResponse<void>>> {
  try {
    // Forward to Besu server
    const response = await fetch(`${BESU_SERVER_URL}/cleanup`, {
      method: 'POST'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to cleanup networks');
    }

    // Clear the local network store
    networkStore.clear();

    return NextResponse.json(await response.json());

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cleanup networks'
    }, { status: 500 });
  }
}
