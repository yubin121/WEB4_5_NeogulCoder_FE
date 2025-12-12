'use client';

import { EllipsisVertical, Tally1 } from 'lucide-react';
import WriteComment from '@/components/common/WriteComment';
import Modal from '@/components/common/Modal';
import { useCallback, useEffect, useRef, useState } from 'react';
import ClickVerticalMenu from '@/components/common/ClickVerticalMenu';
import Image from 'next/image';
import buddyEnergy from '@/assets/images/buddy-energy.svg';
import { usePathname, useRouter } from 'next/navigation';
import CommentList from '@/components/common/CommentList';
import { fetchInfo } from '@/lib/api/recruitment/fetchInfo';
import { formatDate } from '@/utils/formatIsoDate';
import { userAuthStore } from '@/stores/userStore';
import basicBunny from '@/assets/images/basic-bunny.svg';
import { changeStatus } from '@/lib/api/recruitment/changeStatus';
import { studyApplication } from '@/lib/api/recruitment/studyApplication';
import ToastViewer from '@/components/common/ToastViewer';
import { studyApplicationApprove } from '@/lib/api/recruitment/studyApplicationApprove';
import { studyApplicationReject } from '@/lib/api/recruitment/studyApplicationReject';
import { fetchStudyApplication } from '@/lib/api/recruitment/fetchStudyApplication';
import Pagination2 from '@/components/common/Pagination2';
import { fetchMyStudyApplicationData } from '@/lib/api/recruitment/fetchMyStudyApplicationData';
import RecruitmentDetailSkeleton from '@/components/recruitment/RecruitmentDetailSkeleton';
import { toast } from 'react-toastify';
import LoginSkeleton from '../auth/skeleton/LoginSkeleton';

export default function RecruitmentDetailPage() {
  const router = useRouter();
  const pathname = usePathname();
  const me = userAuthStore((state) => state.user);
  const handleGoToPr = () => {
    router.push(`/profile/pr/${userId}`);
  };

  const target = 'recruitment';
  const complete = 'COMPLETE';
  const recruitmentPostId = Number(pathname.split('/').pop());
  const [isOpen, setIsOpen] = useState(false);
  const [appIsOpen, setAppIsOpen] = useState(false);
  const [menuIsOpen, menuSetIsOpen] = useState(false);
  const [statusModalIsOpen, setStatusModalIsOpen] = useState(false);
  const [startedDate, setStartedDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [recruitmentCount, setRecruitmentCount] = useState(0);
  const [category, setCategory] = useState('');
  const [studyType, setStudyType] = useState('');
  const [location, setLocation] = useState('');
  const [createdDate, setCreatedDate] = useState('');
  const [nickname, setNickname] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');
  const [userId, setUserId] = useState('');
  const [commentCount, setCommentCount] = useState(0);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [expiredDate, setExpiredDate] = useState('');
  const [comments, setComments] = useState<CommentType[]>([]);
  const [writeApplicationReason, setWriteApplicationReason] = useState('');
  const [page, setPage] = useState(0);
  const [applications, setApplications] = useState<ApplicationType[]>([]);
  const [myApplications, setMyApplications] = useState<MyApplicationType[]>([]);
  const [totalElementCount, setTotalElementCount] = useState(0);
  const totalPages = Math.ceil(totalElementCount / 5);
  const menuRef = useRef<HTMLDivElement>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStatusChange, setIsStatusChange] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const isApplied = myApplications.some(
    (app) => app.recruitmentPostId === recruitmentPostId
  );

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

  type CommentType = {
    userId: number;
    nickname: string;
    imageUrl: string;
    content: string;
    createdAt: string;
    commentId: number;
  };

  type ApplicationType = {
    applicationId: number;
    userId: number;
    nickname: string;
    profileImageUrl: string;
    buddyEnergy: number;
    createdDate: string;
    applicationReason: string;
  };

  type MyApplicationType = {
    recruitmentPostId: number;
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
      setCreatedDate(data.postDetailsInfo.createdDate);
      setNickname(data.postDetailsInfo.nickname);
      setSubject(data.postDetailsInfo.subject);
      setContent(data.postDetailsInfo.content);
      setProfileImageUrl(data.postDetailsInfo.imageUrl);
      setExpiredDate(data.postDetailsInfo.expiredDate);
      setStatus(data.postDetailsInfo.status);
      setUserId(data.postDetailsInfo.userId);
      setCommentCount(data.commentCount);
      setComments(data.commentsWithWriterInfos);
    } catch (error) {
      console.error('데이터 불러오기 실패ㅠㅠ:', error);
    }
  }, [recruitmentPostId]);

  const fetchApplicationData = useCallback(async () => {
    if (!me || me.nickname !== nickname) return;
    try {
      setIsAppLoading(true);
      const appData = await fetchStudyApplication(recruitmentPostId, page);
      setApplications(appData.receivedApplications);
      setTotalElementCount(appData.totalElementCount);
    } catch (error) {
      console.error('신청 내역 불러오기 오류:', error);
    } finally {
      setIsAppLoading(false);
    }
  }, [me, nickname, recruitmentPostId, page]);

  const fetchMyStudyApplication = useCallback(async () => {
    try {
      const myAppData = await fetchMyStudyApplicationData(page);
      setMyApplications(myAppData.applications);
    } catch (error) {
      console.error('신청 내역 불러오기 오류:', error);
    }
  }, [page]);

  const handleStudyAppSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await studyApplication(recruitmentPostId, writeApplicationReason);
      toast.success('모집 신청이 완료되었습니다!');
      await fetchMyStudyApplication();
      setAppIsOpen(false);
    } catch (error) {
      console.error('생성 실패', error);
      toast.error('모집 신청 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeStatus = async () => {
    if (isStatusChange) return;
    setIsStatusChange(true);

    try {
      await changeStatus(recruitmentPostId, complete);
      await fetchData();
      setStatusModalIsOpen(false);
    } catch (error) {
      console.error('상태 변경 실패:', error);
    } finally {
      setIsStatusChange(false);
    }
  };

  const handleApprove = async (applicationId: number) => {
    if (isApproving) return;
    setIsApproving(true);

    try {
      await studyApplicationApprove(applicationId);
      toast.success('신청이 승인되었습니다.');
      await fetchApplicationData();
    } catch (error) {
      console.error('신청 승인요청 실패:', error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async (applicationId: number) => {
    if (isRejecting) return;
    setIsRejecting(true);
    try {
      await studyApplicationReject(applicationId);
      toast.success('신청이 거절되었습니다.');
      await fetchApplicationData();
    } catch (error) {
      console.error('신청 거절요청 실패:', error);
    } finally {
      setIsRejecting(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        menuSetIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        if (!isNaN(recruitmentPostId)) {
          await fetchData();
          await fetchApplicationData();
          await fetchMyStudyApplication();
        }
      } catch (error) {
        console.error('스터디 리스트 불러오기 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData(); // 실행
  }, [
    recruitmentPostId,
    fetchData,
    fetchApplicationData,
    fetchMyStudyApplication,
  ]);

  return (
    <>
      {isLoading ? (
        <RecruitmentDetailSkeleton />
      ) : (
        <div className='w-full lg:w-[852px] mx-auto'>
          <div className='hidden 2xl:flex flex-col fixed right-[15%] space-y-2.5'>
            <button
              onClick={() => {
                if (status === '완료' || isApplied) return;
                if (me?.nickname === nickname) {
                  setStatusModalIsOpen(true);
                } else {
                  setAppIsOpen(true);
                }
              }}
              className={`!w-full lg:!w-[118px] h-[44px] tm3 rounded-[10px] text-white ${
                status === '완료' || isApplied
                  ? 'bg-gray-400 '
                  : 'bg-[#00C471] hover:bg-[#00B261]'
              }`}
            >
              {status === '완료'
                ? '모집 완료'
                : me?.nickname === nickname
                ? '모집 중'
                : isApplied
                ? '모집 신청 완료'
                : '모집 신청'}
            </button>

            {me?.nickname === nickname && (
              <button
                onClick={() => setIsOpen(true)}
                className='!w-full lg:!w-[118px] h-[44px] border bg-white hover:bg-gray-100 tm3 rounded-[10px]'
                style={{ borderColor: 'var(--color-gray2)' }}
              >
                신청 내역
              </button>
            )}
          </div>

          <div className='flex justify-between'>
            <div className='flex'>
              <span className='text-lg lg:text-[25px] text-[#111111] font-bold'>
                {subject}
              </span>
            </div>
            {me?.nickname === nickname && (
              <div className='relative' ref={menuRef}>
                <button
                  className={`flex w-10 h-10 rounded-[10px] justify-center items-center ${
                    menuIsOpen ? 'bg-[#f5f5f5]' : 'hover:bg-[#f5f5f5]'
                  }`}
                  onClick={() => menuSetIsOpen((prev) => !prev)}
                >
                  <EllipsisVertical />
                </button>
                {menuIsOpen && (
                  <ClickVerticalMenu
                    title='내 게시물'
                    target={target}
                    recruitmentPostId={recruitmentPostId}
                  />
                )}
              </div>
            )}
          </div>

          <div className='flex space-x-6 items-center my-6 justify-between'>
            <div className='flex justify-center items-center'>
              <div>
                <button
                  className='w-[50px] h-[50px] rounded-full bg-white border-[1px] shrink-0 relative overflow-hidden mr-5'
                  style={{ borderColor: 'var(--color-border1)' }}
                  onClick={handleGoToPr}
                >
                  <Image
                    src={profileImageUrl || basicBunny.src}
                    width={50}
                    height={50}
                    alt='예시 기본 프사'
                    className='absolute inset-0 w-full h-full object-cover object-center'
                  />
                </button>
              </div>
              <button className='tm3' onClick={handleGoToPr}>
                {nickname}
              </button>
            </div>

            <div>
              <span className='tm4 opacity-50 mr-3 text-[10px] lg:text-xs'>
                {formatDate(createdDate)}
              </span>
            </div>
          </div>
          <hr
            className='h-0.5 mb-10'
            style={{ borderColor: 'var(--color-border2)' }}
          />
          <div className='space-y-10'>
            <div className='flex space-x-12'>
              <div className='flex w-[400px]'>
                <span className='mr-8 tm3 opacity-50 text-xs lg:text-sm'>
                  시작 날짜
                </span>
                <span className='tm3 text-xs lg:text-sm'>
                  {formatDate(startedDate)}
                </span>
              </div>
              <div className='flex w-[400px]'>
                <span className='mr-8 tm3 opacity-50 text-xs lg:text-sm'>
                  종료 날짜
                </span>
                <span className='tm3 text-xs lg:text-sm'>
                  {formatDate(endDate)}
                </span>
              </div>
            </div>
            <div className='flex space-x-12'>
              <div className='flex w-[400px]'>
                <span className='mr-8 tm3 opacity-50 text-xs lg:text-sm '>
                  모집 인원
                </span>
                <span className='tm3 text-xs lg:text-sm'>
                  {recruitmentCount} 명
                </span>
              </div>
              <div className='flex w-[400px]'>
                <span className='mr-8 tm3 opacity-50 text-xs lg:text-sm'>
                  카테고리
                </span>
                <div className='tag-type1 tb5'>
                  {' '}
                  {category ? categoryDisplayNames[category] : '카테고리'}
                </div>
              </div>
            </div>
            <div className='flex space-x-12'>
              <div className='flex w-[400px]'>
                <span className='mr-8 tm3 opacity-50 text-xs lg:text-sm'>
                  진행 방식
                </span>
                <span className='tm3 text-xs lg:text-sm'>
                  {studyType ? StudyTypeDisplayNames[studyType] : '카테고리'}
                </span>
              </div>
              <div className='flex w-[400px]'>
                <span className='mr-8 tm3 opacity-50 text-xs lg:text-sm'>
                  {location ? '지역' : '모집 마감일'}
                </span>
                <span className='tm3 text-xs lg:text-sm'>
                  {location ? location : formatDate(expiredDate)}
                </span>
              </div>
            </div>

            {location && (
              <div className='flex w-[400px]'>
                <span className='mr-8 tm3 opacity-50 text-xs lg:text-sm'>
                  모집 마감일
                </span>
                <span className='tm3 text-xs lg:text-sm'>
                  {formatDate(expiredDate)}
                </span>
              </div>
            )}
          </div>
          <div
            className='w-full h-[600px] my-10 border-[1px] rounded-[10px] p-5 tm3'
            style={{ borderColor: 'var(--color-border3)' }}
          >
            {content && (
              <ToastViewer key={content} height='100%' initialValue={content} />
            )}
          </div>
          <div className='2xl:hidden flex flex-row space-x-4 space-y-4  mt-6 mb-10 '>
            <button
              onClick={() => {
                if (status === '완료' || isApplied) return;
                if (me?.nickname === nickname) {
                  setStatusModalIsOpen(true);
                } else {
                  setAppIsOpen(true);
                }
              }}
              className={`w-full h-[44px] tm3 rounded-[10px] text-white ${
                status === '완료' || isApplied
                  ? 'bg-gray-400'
                  : 'bg-[#00C471] hover:bg-[#00B261]'
              }`}
            >
              {status === '완료'
                ? '모집 완료'
                : me?.nickname === nickname
                ? '모집 중'
                : isApplied
                ? '모집 신청 완료'
                : '모집 신청'}
            </button>
            {me?.nickname === nickname && (
              <button
                onClick={() => setIsOpen(true)}
                className='w-full h-[44px] border bg-white hover:bg-gray-100 tm3 rounded-[10px]'
                style={{ borderColor: 'var(--color-gray2)' }}
              >
                신청 내역
              </button>
            )}
          </div>
          <div className='w-full'>
            <WriteComment
              key={refreshKey}
              userId={me?.id}
              target={target}
              postId={recruitmentPostId}
              commentCount={commentCount}
              profileImageUrl={me?.profileImageUrl}
              onCommentAdd={fetchData}
            />
          </div>
          <div className='w-full'>
            <CommentList
              postId={recruitmentPostId}
              comments={comments}
              target={target}
              setCommentCount={setCommentCount}
              setRefreshKey={setRefreshKey}
            />
          </div>

          {isOpen && (
            <Modal
              title=''
              className='w-[1020px] h-full lg:h-auto overflow-y-auto'
              onClose={() => setIsOpen(false)}
            >
              {isAppLoading ? (
                <div className='flex flex-1 h-[300px] justify-center items-center text-gray-400 overflow-hidden'>
                  <LoginSkeleton />
                </div>
              ) : applications.length === 0 ? (
                <div className='flex flex-1 min-h-[300px] justify-center items-center tm3 text-gray-500'>
                  신청 내역이 없습니다
                </div>
              ) : (
                <div className='flex flex-col min-h-full'>
                  {applications.map((app) => (
                    <div
                      key={app.applicationId}
                      className='rounded-[10px]  w-full'
                    >
                      <div className='flex justify-between w-full'>
                        <div className='flex space-x-6 items-center mb-10'>
                          <button
                            className='w-15 h-15 rounded-full bg-white border-[1px] shrink-0 relative overflow-hidden mr-5'
                            style={{ borderColor: 'var(--color-border1)' }}
                            onClick={() =>
                              router.push(`/profile/pr/${app.userId}`)
                            }
                          >
                            <Image
                              src={app.profileImageUrl ?? basicBunny.src}
                              width={50}
                              height={50}
                              alt='예시 기본 프사'
                              className='absolute inset-0 w-full h-full object-cover object-center'
                            />
                          </button>
                          <div className='flex flex-col'>
                            <div
                              className='tm3 cursor-pointer ml-3'
                              onClick={() =>
                                router.push(`/profile/pr/${app.userId}`)
                              }
                            >
                              {app.nickname}
                            </div>
                            <div className='flex justify-center items-center'>
                              <div className='flex justify-center items-center'>
                                <Image
                                  src={buddyEnergy}
                                  alt='버디 에너지'
                                  className='w-[40px] h-[40px]'
                                />
                                <div className='tm4 opacity-50 justify-center items-center'>
                                  {app.buddyEnergy}%
                                </div>
                              </div>
                              <div className='tm4 opacity-20 ml-5'>
                                <Tally1 />
                              </div>
                              <div>
                                <span className='tm4 opacity-50'>
                                  {formatDate(app.createdDate)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className='w-full h-[400px] border-[1px] rounded-[10px] p-5 mb-10'
                        style={{ borderColor: 'var(--color-border3)' }}
                      >
                        {app.applicationReason}
                      </div>

                      <div className='flex space-x-[15px] justify-end mb-10'>
                        <button
                          className='w-full lg:w-[100px] h-11 rounded-md text-white tm3 bg-[#B2B2B2] hover:bg-[#9A9A9A]'
                          onClick={() => handleReject(app.applicationId)}
                          disabled={isRejecting}
                        >
                          거절
                        </button>
                        <button
                          className='w-full lg:w-[100px] h-11 rounded-md text-white tm3 bg-[#2d90ff] hover:bg-[#217AEC]'
                          onClick={() => handleApprove(app.applicationId)}
                          disabled={isApproving}
                        >
                          승인
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className='pt-4 pb-6 flex justify-center border-gray-200'>
                    <Pagination2
                      page={page}
                      setPage={setPage}
                      totalPages={totalPages}
                    />
                  </div>
                </div>
              )}
            </Modal>
          )}

          {appIsOpen && (
            <Modal
              title='모집 신청하기'
              className='w-[1020px] h-full lg:h-auto'
              onClose={() => setAppIsOpen(false)}
            >
              <textarea
                className='w-full h-[440px] border-[1px] p-5  my-6 rounded-[6px]'
                placeholder='지원 동기를 입력해주세요'
                style={{ borderColor: 'var(--color-border3)' }}
                value={writeApplicationReason}
                onChange={(e) => setWriteApplicationReason(e.target.value)}
              ></textarea>
              <div className='flex justify-end '>
                <button
                  className='button-type6 mr-[15px] hover:bg-[#f5f5f5]'
                  onClick={() => setAppIsOpen(false)}
                >
                  취소
                </button>
                <button
                  className='button-type5 hover:bg-[#292929]'
                  onClick={handleStudyAppSubmit}
                  disabled={
                    writeApplicationReason.trim() === '' || isSubmitting
                  }
                >
                  확인
                </button>
              </div>
            </Modal>
          )}
          {statusModalIsOpen && (
            <div className='bg-black/50 fixed top-0 bottom-0 left-0 right-0 z-30 flex items-center justify-center'>
              <div className='pt-10 pb-8 px-9 rounded-[10px] bg-white drop-shadow-md'>
                <p className='mb-7 tm3 text-center'>
                  스터디 모집을 완료하시겠습니까? <br />
                  모집 완료로 변경하면 더 이상 신청을 받을 수 없습니다.
                </p>
                <div className='flex gap-4 justify-center'>
                  <button
                    className='button-type6 w-[120px]!'
                    onClick={() => setStatusModalIsOpen(false)}
                  >
                    취소
                  </button>
                  <button
                    className='button-type5 w-[120px]! bg-red! text-white! hover:bg-[#e14d4a]!'
                    onClick={handleChangeStatus}
                    disabled={isStatusChange}
                  >
                    확인
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
