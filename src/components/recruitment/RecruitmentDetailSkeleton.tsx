export default function RecruitmentDetailSkeleton() {
  return (
    <div className='w-full lg:w-[852px] mx-auto animate-pulse'>
      <div className='flex mb-4'>
        <div className='w-[300px] h-[40px] rounded-md bg-gray-200' />
      </div>

      <div className='flex items-center space-x-6 my-6'>
        <div className='w-[50px] h-[50px] rounded-full bg-gray-200' />
        <div className='w-[200px] h-[40px] rounded-md bg-gray-200' />
        <div className='w-[200px] h-[40px] rounded-md ml-auto bg-gray-200' />
      </div>

      <hr className='h-0.5 mb-10 bg-gray-200 border-0' />

      <div className='space-y-10'>
        {[...Array(3)].map((_, i) => (
          <div key={i} className='flex space-x-12'>
            <div className='w-[300px] lg:w-[400px] h-[60px] rounded-md bg-gray-200' />
            <div className='w-[300px] lg:w-[400px] h-[60px] rounded-md bg-gray-200' />
          </div>
        ))}
        <div className='w-[300px] lg:w-[400px] h-[60px] rounded-md bg-gray-200' />
      </div>

      <div className='w-full h-[600px] my-10  rounded-[10px] '>
        <div className='w-full h-full rounded-[10px] bg-gray-200' />
      </div>

      <div className='2xl:hidden flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mt-6 mb-10'>
        <div className='w-full h-[44px] rounded-[10px] bg-gray-200' />
        <div className='w-full h-[44px] rounded-[10px] bg-gray-200' />
      </div>

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
