'use client';

import { ChevronDown } from 'lucide-react';
import ClientEditorWrapper from '@/components/common/ClientEditorWrapper';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Editor as ToastEditor } from '@toast-ui/react-editor';
import { fetchStudyInfo } from '@/lib/api/study/fetchStudyInfo';
import { modifyStudyPost } from '@/lib/api/study/modify';
import { usePathname, useRouter } from 'next/navigation';
import CategoryStudyModal2 from '@/components/study/CategoryStudyModal2';
import StudyPostModifySkeleton from '@/components/study/StudyPostModifySkeleton';
import { toast } from 'react-toastify';

export default function StudyCommunityModifyPage() {
  const pathname = usePathname();
  const router = useRouter();
  const postId = Number(pathname.split('/').pop());
  const studyId = Number(pathname.split('/')[2]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const isSelectedCategory = category !== '카테고리';
  const editorRef = useRef<ToastEditor>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryDisplayNames: Record<string, string> = {
    NOTICE: '공지',
    FREE: '자유',
  };

  const reverseCategoryDisplayNames = Object.fromEntries(
    Object.entries(categoryDisplayNames).map(([key, val]) => [val, key])
  );

  const fetchData = useCallback(async () => {
    try {
      const data = await fetchStudyInfo(postId);
      setCategory(data.postInfo.category);
      setTitle(data.postInfo.title);
      setContent(data.postInfo.content);
    } catch (error) {
      console.error('데이터 불러오기 실패ㅠㅠ:', error);
    }
  }, [postId]);

  useEffect(() => {
    try {
      if (!isNaN(postId)) {
        fetchData();
      }
    } catch (error) {
      console.error('데이터 받아오기 에러', error);
    } finally {
      setIsLoading(false);
    }
  }, [postId, fetchData]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const instance = editorRef.current?.getInstance();
    const content = instance?.getMarkdown() || '';

    const payload = {
      title: title,
      category: category,
      content: content,
    };

    try {
      await modifyStudyPost(postId, payload);
      toast.success('게시글 수정이 완료되었습니다!');
      router.push(`/study/${studyId}/study-community/detail/${postId}`);
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
        <StudyPostModifySkeleton />
      ) : (
        <div>
          <div className='relative '>
            <button
              type='button'
              style={{ borderColor: 'var(--color-border3)' }}
              className={`w-[320px] h-10 lg:h-15 rounded-[10px] flex items-center justify-between p-5 border mb-6  ${
                isSelectedCategory
                  ? 'border-main text-text1 tm4'
                  : 'border-main/10 text-text1/50 tm4'
              } `}
              onClick={() => setIsCategoryOpen((prev) => !prev)}
            >
              <p
                className={`mr-1 ${!category ? 'text-gray-400' : 'text-black'}`}
              >
                {category
                  ? categoryDisplayNames[category] || category
                  : '게시글 유형을 선택해 주세요'}
              </p>
              <ChevronDown className='w-4 h-4 lg:w-6 lg:h-6' />
            </button>

            {isCategoryOpen && (
              <div className='absolute top-10 lg:top-15 left-0 z-10'>
                <CategoryStudyModal2
                  onSelect={(selected: string) => {
                    const engCode =
                      reverseCategoryDisplayNames[selected] || selected;
                    setCategory(engCode);
                    setIsCategoryOpen(false);
                  }}
                />
              </div>
            )}
          </div>
          <input
            className='border-[1px] w-full h-10 lg:h-15 rounded-[10px] p-5 mb-10 tm4'
            style={{ borderColor: 'var(--color-border3)' }}
            placeholder='제목을 입력해주세요'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          ></input>
          <div className='mb-10'>
            <ClientEditorWrapper editorRef={editorRef} content={content} />
          </div>
          <div className='flex justify-end'>
            <button className='button-type6 !w-full lg:!w-[100px] mr-[15px] hover:bg-[#f5f5f5]'>
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
