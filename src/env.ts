console.log('aaaa')
export const getRegion = (): 'US' | 'CA' => {
  return (process.env.REGION as any) || 'CA'
}

export function getStage() {
  return process.env.STAGE
}
