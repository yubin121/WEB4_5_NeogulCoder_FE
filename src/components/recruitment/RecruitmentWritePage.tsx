'use client';

import { ChevronDown, Calendar } from 'lucide-react';
import ClientEditorWrapper from '@/components/common/ClientEditorWrapper';
import { useEffect, useRef, useState } from 'react';
import { Editor as ToastEditor } from '@toast-ui/react-editor';
import { writeRecruitmentPost } from '@/lib/api/recruitment/write';
import { fetchStudy } from '@/lib/api/recruitment/fetchStudy';
import { fetchStudyList } from '@/lib/api/recruitment/fetchStudyList';
import { formatDate } from '@/utils/formatDate';
import StudyListModal from '@/components/study/StudyListModal';
import RemainSlotModal from '@/components/study/RemainSlot';
import { useRouter } from 'next/navigation';
import RecruitmentFormSkeleton from '@/components/recruitment/RecruitmentFormSkeleton';
import { toast } from 'react-toastify';

export default function RecruitmentWritePage() {
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [studyId, setStudyId] = useState<number | ''>('');
  const [remainSlots, setRemainSlots] = useState<number | null>(null);
  const [expiredDate, setExpiredDate] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [studyType, setStudyType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  // const [content, setContent] = useState('');
  const [isClick, setIsClick] = useState(false);
  const [isStudyOpen, setIsStudyOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const displayText =
    remainSlots === null
      ? '1명 ~ 10명 이상'
      : remainSlots === 10
      ? '10명 이상'
      : `${remainSlots}명`;
  const [studyList, setStudyList] = useState<
    { studyId: number; name: string }[]
  >([]);

  const editorRef = useRef<ToastEditor>(null);
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

  const handleFetchData = async () => {
    setIsClick(true);
    try {
      const data = await fetchStudy(Number(studyId));
      setCategory(data.category);
      setLocation(data.location);
      setStudyType(data.studyType);
      setStartDate(data.startDate);
      setEndDate(data.endDate);
      setRemainSlots(data.remainSlots);
    } catch (error) {
      console.error('데이터 불러오기 실패ㅠㅠ:', error);
    }
  };

  useEffect(() => {
    const loadStudyList = async () => {
      try {
        setIsLoading(true);
        const data = await fetchStudyList();
        setStudyList(data.studyInfos);
      } catch (error) {
        console.error('스터디 리스트 불러오기 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStudyList();
  }, []);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!isClick) {
      toast.warning('스터디를 선택해주세요.');
      setIsSubmitting(false);
      return;
    }

    if (!expiredDate) {
      toast.warning('모집 마감일을 입력해주세요.');
      setIsSubmitting(false);
      return;
    }

    if (remainSlots === null) {
      toast.warning('모집 인원을 선택해주세요.');
      setIsSubmitting(false);
      return;
    }

    if (!subject.trim()) {
      toast.warning('제목을 입력해주세요.');
      setIsSubmitting(false);
      return;
    }

    const instance = editorRef.current?.getInstance();
    const content = instance?.getMarkdown() || '';

    if (!content.trim()) {
      toast.warning('내용을 입력해주세요.');
      setIsSubmitting(false);
      return;
    }

    // 모든 조건 충족 시, API 호출
    const payload = {
      studyId: studyId,
      subject: subject,
      content: content,
      recruitmentCount: Number(remainSlots),
      expiredDate: new Date(expiredDate).toISOString(),
    };

    try {
      const data = await writeRecruitmentPost(payload);
      const postId = data.data;
      toast.success('게시글 작성이 완료되었습니다!');
      router.push(`/recruitment/detail/${postId}`);
    } catch (error) {
      console.error('작성 실패', error);
      toast.error('게시글 작성 중 오류가 발생하였습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isLoading ? (
        <RecruitmentFormSkeleton />
      ) : (
        <div className='w-full max-w-full lg:max-w-[920px] mx-auto'>
          <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-0'>
            <div className='flex items-center mb-2 lg:mb-0'>
              <div className='flex w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-[#111111] justify-center items-center'>
                <span className='text-white tb2'>1</span>
              </div>
              <span className='tb2 mx-[10px] lg:mx-[25px] text-base lg:text-lg align-center'>
                스터디 기본 정보를 입력해주세요
              </span>
            </div>

            <div className='flex  lg:flex-row items-stretch lg:items-center gap-2 lg:gap-2'>
              <div className='relative inline-block w-full  lg:w-[320px]'>
                <button
                  type='button'
                  style={{ borderColor: 'var(--color-border3)' }}
                  className={`w-full lg:w-[320px] h-10 lg:h-15 rounded-[10px] flex items-center justify-between p-5 border ${
                    studyId
                      ? 'border-main text-text1 tm4'
                      : 'border-main/10 text-text1/50 tm4'
                  }`}
                  onClick={() => {
                    // studyList가 없거나 studyId가 선택되지 않았으면 경고
                    if (!studyList.length || !studyId) {
                      toast.warning('우선 스터디를 생성해주세요.');
                      setIsSubmitting(false);
                      return;
                    }

                    // 버튼 열기 토글
                    setIsStudyOpen((prev) => !prev);
                  }}
                >
                  <p
                    className={`mr-1 ${
                      !studyId ? 'text-gray-400' : 'text-black'
                    }`}
                  >
                    {studyId
                      ? studyList.find((study) => study.studyId === studyId)
                          ?.name
                      : '스터디를 선택해주세요'}
                  </p>
                  <ChevronDown className='w-4 h-4 lg:w-6 lg:h-6' />
                </button>

                {isStudyOpen && (
                  <div className='absolute top-10 lg:top-15 left-0 z-10 w-full lg:w-auto'>
                    <StudyListModal
                      studyList={studyList}
                      onSelect={(selectedId) => {
                        setStudyId(selectedId);
                        setIsStudyOpen(false);
                      }}
                    />
                  </div>
                )}
              </div>

              <button
                className='button-type7 hover:bg-[#292929] w-full lg:w-auto'
                onClick={handleFetchData}
                disabled={studyId === ''}
              >
                가져오기
              </button>
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
              <div className='flex h-10 lg:h-15 rounded-[10px] py-2 lg:py-5 px-5 mb-5 lg:mb-10 cursor-not-allowed bg-gray4 justify-between'>
                <div>
                  <span className='text-xs lg:text-base'>
                    {startDate ? formatDate(startDate) : '연도-월-일'}
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
                  className={`w-full h-10 lg:h-15 rounded-[10px] flex items-center justify-between py-2 lg:py-5 px-5 border mb-6 text-left text-xs lg:text-base ${
                    remainSlots !== null ? 'text-black' : 'text-gray-400'
                  }`}
                  onClick={() => setIsOpen((prev) => !prev)}
                >
                  <span>{displayText}</span>
                  <ChevronDown className='w-4 h-4 lg:w-6 lg:h-6' />
                </button>

                {isOpen && (
                  <div className='absolute top-10 lg:top-15 left-0 z-10 w-screen max-w-full lg:w-auto'>
                    <RemainSlotModal
                      onSelect={(value) => {
                        setRemainSlots(value);
                        setIsOpen(false);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className='flex flex-col w-full lg:max-w-[440px]'>
              <span className='tm-0 mb-2.5 text-xs lg:text-base'>카테고리</span>
              <div className='relative inline-block  '>
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
                <div className='flex  items-center w-full  h-10 lg:h-15 cursor-not-allowed bg-gray4 pl-4 pr-10 appearance-none rounded-[10px] '>
                  <span className='text-xs lg:text-base'>
                    {studyType ? StudyTypeDisplayNames[studyType] : '진행 방식'}
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
              value={expiredDate}
              onChange={(e) => setExpiredDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]} // 선택 가능한 최소 날짜를 오늘로 지정
              max={endDate.split('T')[0]}
            />
          </div>
          <div className='flex items-center mt-5 lg:mt-10'>
            <div className='flex w-8 h-8 lg:w-10 lg:h-10  rounded-full bg-[#111111] justify-center items-center'>
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
          ></input>
          <div className='mb-5 lg:mb-10'>
            <ClientEditorWrapper editorRef={editorRef} />
          </div>
          <div className='flex justify-end'>
            <button
              className='button-type6 !w-full lg:!w-[100px] mr-[15px] hover:bg-[#f5f5f5]'
              onClick={() => router.push(`/#recruit`)}
            >
              취소
            </button>
            <button
              className='button-type5 !w-full lg:!w-[100px] hover:bg-[#292929]'
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              등록
            </button>
          </div>
        </div>
      )}
    </>
  );
}
