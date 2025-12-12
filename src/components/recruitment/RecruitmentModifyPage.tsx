'use client';

import { ChevronDown, Calendar } from 'lucide-react';
import ClientEditorWrapper from '@/components/common/ClientEditorWrapper';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Editor as ToastEditor } from '@toast-ui/react-editor';
import { usePathname, useRouter } from 'next/navigation';
import { fetchInfo } from '@/lib/api/recruitment/fetchInfo';
import { modifyRecruitmentPost } from '@/lib/api/recruitment/modify';
import { formatDate } from '@/utils/formatIsoDate';
import RemainSlotModal from '@/components/study/RemainSlot';
import RecruitmentModifySkeleton from '@/components/recruitment/RecruitmentModifySkeleton';
import { toast } from 'react-toastify';

export default function RecruitmentModifyPage() {
  const pathname = usePathname();
  const router = useRouter();
  const recruitmentPostId = Number(pathname.split('/').pop());
  const [startedDate, setStartedDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [recruitmentCount, setRecruitmentCount] = useState(0);
  const [category, setCategory] = useState('');
  const [studyType, setStudyType] = useState('');
  const [location, setLocation] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [expiredDate, setExpiredDate] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const editorRef = useRef<ToastEditor>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const displayText =
    recruitmentCount === null
      ? '1명 ~ 10명 이상'
      : recruitmentCount === 10
      ? '10명 이상'
      : `${recruitmentCount}명`;

  const categoryDisplayNames: Record<string, string> = {
    LANGUAGE: '어학',
    IT: 'IT',
    EXAM: '고시/자격증',
    FINANCE: '금융',
    MANAGEMENT: '경영',
    DESIGN: '디자인',
    ART: '예술',
    PHOTO_VIDEO: '사진/영상',
    BEAUTY: '뷰티',
    SPORTS: '스포츠',
    HOBBY: '취미',
    ETC: '기타',
  };

  const StudyTypeDisplayNames: Record<string, string> = {
    ONLINE: '온라인',
    OFFLINE: '오프라인',
    HYBRID: '온/오프라인',
  };

  const fetchData = useCallback(async () => {
    try {
      const data = await fetchInfo(recruitmentPostId);
      setCategory(data.postDetailsInfo.category);
      setLocation(data.postDetailsInfo.location);
      setStudyType(data.postDetailsInfo.studyType);
      setStartedDate(data.postDetailsInfo.startedDate);
      setEndDate(data.postDetailsInfo.endDate);
      setRecruitmentCount(data.postDetailsInfo.recruitmentCount);
      setSubject(data.postDetailsInfo.subject);
      setContent(data.postDetailsInfo.content);
      setExpiredDate(data.postDetailsInfo.expiredDate);
    } catch (error) {
      console.error('데이터 불러오기 실패ㅠㅠ:', error);
    }
  }, [recruitmentPostId]);

  useEffect(() => {
    try {
      if (!isNaN(recruitmentPostId)) {
        fetchData();
      }
    } catch (error) {
      console.error('데이터 불러오기 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [recruitmentPostId, fetchData]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const instance = editorRef.current?.getInstance();
    const content = instance?.getMarkdown() || '';

    const payload = {
      subject: subject,
      content: content,
      recruitmentCount: recruitmentCount,
      expiredDate: new Date(expiredDate).toISOString(),
    };

    try {
      const data = await modifyRecruitmentPost(recruitmentPostId, payload);
      const postId = data.data;
      toast.success('게시글 수정이 완료되었습니다!');
      router.push(`/recruitment/detail/${postId}`);
    } catch (error) {
      console.error('수정 실패', error);
      toast.error('게시글 수정 중 오류가 발생하였습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isLoading ? (
        <RecruitmentModifySkeleton />
      ) : (
        <div className='w-auto max-w-[920px] mx-auto'>
          <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-0'>
            <div className='flex items-center mb-2 lg:mb-0'>
              <div className='flex w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-[#111111] justify-center items-center'>
                <span className='text-white tb2'>1</span>
              </div>
              <span className='tb2 mx-[10px] lg:mx-[25px] text-base lg:text-lg align-center'>
                스터디 기본 정보를 입력해주세요
              </span>
            </div>
          </div>
          <hr
            className='h-0.5 my-8 lg:my-10'
            style={{ borderColor: 'var(--color-border2)' }}
          />
          <div className='flex flex-col lg:flex-row space-x-10'>
            <div className='flex flex-col w-full lg:max-w-[440px]'>
              <span className='tm-0 mb-2.5 text-xs lg:text-base'>
                시작 날짜
              </span>
              <div className='flex h-10 lg:h-15 rounded-[10px] py-2 lg:py-5 px-5 mb-5  lg:mb-10 cursor-not-allowed bg-gray4 justify-between'>
                <div>
                  <span className='text-xs lg:text-base'>
                    {startedDate ? formatDate(startedDate) : '연도-월-일'}
                  </span>
                </div>
                <div>
                  <Calendar className='w-4 h-4' />
                </div>
              </div>
            </div>
            <div className='flex flex-col w-full lg:max-w-[440px]'>
              <span className='tm-0 mb-2.5 text-xs lg:text-base'>
                종료 날짜
              </span>
              <div className='flex h-10 lg:h-15 rounded-[10px] py-2 lg:py-5 px-5 mb-5 lg:mb-10 cursor-not-allowed bg-gray4 justify-between'>
                <div>
                  <span className='text-xs lg:text-base'>
                    {endDate ? formatDate(endDate) : '연도-월-일'}
                  </span>
                </div>
                <div>
                  <Calendar className='w-4 h-4' />
                </div>
              </div>
            </div>
          </div>
          <div className='flex flex-col lg:flex-row space-x-10 mb-6'>
            <div className='flex flex-col w-full lg:max-w-[440px]'>
              <span className='tm-0 mb-2.5 text-xs lg:text-base'>
                모집 인원
              </span>
              <div className='relative inline-block '>
                <button
                  type='button'
                  style={{ borderColor: 'var(--color-border3)' }}
                  className={`w-full h-10 lg:h-15 rounded-[10px] flex items-center justify-between p-5 border mb-6 text-left ${
                    recruitmentCount !== null ? 'text-black' : 'text-gray-400'
                  }`}
                  onClick={() => setIsOpen((prev) => !prev)}
                >
                  <span className='text-xs lg:text-base'>{displayText}</span>
                  <ChevronDown className='w-4 h-4 lg:w-6 lg:h-6' />
                </button>

                {isOpen && (
                  <div className='absolute top-[60px] left-0 z-10 w-screen max-w-full lg:w-auto'>
                    <RemainSlotModal
                      onSelect={(value) => {
                        setRecruitmentCount(value);
                        setIsOpen(false);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className='flex flex-col w-full lg:max-w-[440px]'>
              <span className='tm-0 mb-2.5 text-xs lg:text-base'>카테고리</span>
              <div className='relative inline-block'>
                <div className='flex  items-center w-full h-10 lg:h-15 cursor-not-allowed bg-gray4 pl-4 pr-10 appearance-none rounded-[10px] '>
                  <span className='text-xs lg:text-base'>
                    {category ? categoryDisplayNames[category] : '카테고리'}
                  </span>
                </div>

                <div className='absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none'>
                  <ChevronDown className='w-4 h-4 lg:w-6 lg:h-6' />
                </div>
              </div>
            </div>
          </div>
          <div className='flex flex-col lg:flex-row space-x-10 '>
            <div className='flex flex-col w-full lg:max-w-[440px] mb-5 lg:mb-10'>
              <span className='tm-0 mb-2.5 text-xs lg:text-base'>
                진행 방식
              </span>
              <div className='relative inline-block'>
                <div className='flex  items-center w-full h-10 lg:h-15 cursor-not-allowed bg-gray4 pl-4 pr-10 appearance-none rounded-[10px] '>
                  <span className='text-xs lg:text-base'>
                    {studyType ? StudyTypeDisplayNames[studyType] : '카테고리'}
                  </span>
                </div>

                <div className='absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none'>
                  <ChevronDown className='w-4 h-4 lg:w-6 lg:h-6' />
                </div>
              </div>
            </div>
            <div className='flex flex-col w-full lg:max-w-[440px] mb-5 lg:mb-10'>
              <span className='tm-0 mb-2.5 text-xs lg:text-base'>지역</span>
              <div className='relative inline-block'>
                <div className='flex  items-center w-full  h-10 lg:h-15 cursor-not-allowed bg-gray4 pl-4 pr-10 appearance-none rounded-[10px] '>
                  <span className='text-xs lg:text-base'>
                    {location ? location : '지역'}
                  </span>
                </div>

                <div className='absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none'>
                  <ChevronDown className='w-4 h-4 lg:w-6 lg:h-6' />
                </div>
              </div>
            </div>
          </div>

          <div className='flex flex-col w-full lg:max-w-[440px]'>
            <span className='tm-0 mb-2.5 text-xs lg:text-base'>
              모집 마감일
            </span>
            <input
              type='date'
              className='border-[1px] h-10 lg:h-15 rounded-[10px] py-2 lg:py-5 px-5 mb-5 lg:mb-10 text-xs lg:text-base'
              style={{ borderColor: 'var(--color-border3)' }}
              value={formatDate(expiredDate)}
              onChange={(e) => setExpiredDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]} // 선택 가능한 최소 날짜를 오늘로 지정
              max={endDate.split('T')[0]}
            />
          </div>
          <div className='flex items-center mt-5 lg:mt-10'>
            <div className='flex w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-[#111111] justify-center items-center'>
              <span className='text-white tb2'>2</span>
            </div>
            <span className='tb2 mx-[10px] lg:mx-[25px] text-base lg:text-lg '>
              스터디에 대해 소개해주세요
            </span>
          </div>
          <hr
            className='h-0.5 my-8 lg:my-10'
            style={{ borderColor: 'var(--color-border2)' }}
          />
          <input
            className='border-[1px] w-full h-10 lg:h-15 rounded-[10px] py-2 lg:py-5 px-5 mb-5 lg:mb-10 tm4'
            style={{ borderColor: 'var(--color-border3)' }}
            placeholder='제목을 입력해주세요'
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <div className='mb-5 lg:mb-10'>
            <ClientEditorWrapper editorRef={editorRef} content={content} />
          </div>
          <div className='flex justify-end'>
            <button
              className='button-type6 !w-full lg:!w-[100px] mr-[15px] hover:bg-[#f5f5f5]'
              onClick={() =>
                router.push(`/recruitment/detail/${recruitmentPostId}`)
              }
            >
              취소
            </button>
            <button
              className='button-type5 !w-full lg:!w-[100px] hover:bg-[#292929]'
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              수정
            </button>
          </div>
        </div>
      )}
    </>
  );
}
