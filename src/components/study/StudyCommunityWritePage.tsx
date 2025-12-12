'use client';

import { ChevronDown } from 'lucide-react';
import ClientEditorWrapper from '@/components/common/ClientEditorWrapper';
import { useRef, useState } from 'react';
import { Editor as ToastEditor } from '@toast-ui/react-editor';
import { writeStudyPost } from '@/lib/api/study/write';
import { usePathname, useRouter } from 'next/navigation';
import CategoryStudyModal2 from '@/components/study/CategoryStudyModal2';
import { toast } from 'react-toastify';

export default function StudyCommunityWritePage() {
  const pathname = usePathname();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSelectedCategory = category !== '카테고리';
  const studyId = Number(pathname.split('/')[2]);
  const editorRef = useRef<ToastEditor>(null);
  const router = useRouter();

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const instance = editorRef.current?.getInstance();
    const content = instance?.getMarkdown() || '';

    if (!category) {
      toast.warning('카테고리를 선택해주세요.');
      setIsSubmitting(false);
      return;
    }

    if (!title) {
      toast.warning('제목을 입력해주세요.');
      setIsSubmitting(false);
      return;
    }

    if (!content.trim()) {
      toast.warning('내용을 입력해주세요.');
      setIsSubmitting(false);
      return;
    }

    const categoryMap: { [key: string]: string } = {
      공지: 'NOTICE',
      자유: 'FREE',
    };

    const englishCategory = categoryMap[category] || category;

    const payload = {
      title: title,
      category: englishCategory, // 영문으로 보냄
      content: content,
    };

    try {
      const data = await writeStudyPost(studyId, payload);
      const postId = data.data;
      toast.success('게시글 작성이 완료되었습니다!');
      router.push(`/study/${studyId}/study-community/detail/${postId}`);
    } catch (error) {
      console.error('작성 실패', error);
      toast.error('게시글 작성 중 오류가 발생하였습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className='relative '>
        <button
          type='button'
          style={{ borderColor: 'var(--color-border3)' }}
          className={`w-full max-w-[320px] h-[60px] rounded-[10px] flex items-center justify-between p-5 border mb-6  ${
            isSelectedCategory
              ? 'border-main text-text1 tm4'
              : 'border-main/10 text-text1/50 tm4'
          } `}
          onClick={() => setIsCategoryOpen((prev) => !prev)}
        >
          <p className={`mr-1 ${!category ? 'text-gray-400' : 'text-black'}`}>
            {category ? category : '게시글 유형을 선택해 주세요'}
          </p>
          <ChevronDown className='w-4 h-4 lg:w-6 lg:h-6' />
        </button>

        {isCategoryOpen && (
          <div className='absolute top-15 left-0 z-10'>
            <CategoryStudyModal2
              onSelect={(category: string) => {
                setCategory(category);
                setIsCategoryOpen(false);
              }}
            />
          </div>
        )}
      </div>

      <input
        className='border-[1px] w-full h-15 rounded-[10px] p-5 mb-10 tm4  placeholder-gray-400'
        style={{ borderColor: 'var(--color-border3)' }}
        placeholder='제목을 입력해주세요'
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      ></input>
      <div className='mb-10'>
        <ClientEditorWrapper editorRef={editorRef} />
      </div>
      <div className='flex justify-end w-full'>
        <button
          className='button-type6 !w-full lg:!w-[100px] mr-[15px] hover:bg-[#f5f5f5]'
          onClick={() => router.push(`/study/${studyId}/study-community`)}
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
    </>
  );
}
