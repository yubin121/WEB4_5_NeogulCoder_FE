export default function StudyPostDetailSkeleton() {
  return (
    <div className='w-full lg:w-[898px] mx-auto animate-pulse space-y-6'>
      <div className='flex justify-between items-center'>
        <div className='w-[60px] h-[40px] rounded-lg bg-gray-200' />
        <div className='w-10 h-10 rounded-lg bg-gray-200' />
      </div>

      <div className='w-full h-10 rounded-md bg-gray-200' />

      <div className='flex justify-between items-center'>
        <div className='flex items-center space-x-4'>
          <div className='w-[50px] h-[50px] rounded-full bg-gray-200' />
          <div className='w-[100px] h-10 rounded-md bg-gray-200' />
        </div>
        <div className='w-[80px] h-10 rounded-md bg-gray-200' />
      </div>

      <div className='w-full min-h-[600px] rounded-lg bg-gray-200' />

      <div className='w-[100px] h-[30px] rounded-md bg-gray-200' />
      <div className='flex space-x-6 my-6'>
        <div className='w-[50px] h-[50px] rounded-full bg-gray-200' />
        <div className='w-full h-[50px] rounded-md bg-gray-200' />
      </div>

      <div className='flex justify-end gap-4'>
        <div className='w-[100px] h-[44px] rounded-[10px] bg-gray-200' />
      </div>
    </div>
  );
}
