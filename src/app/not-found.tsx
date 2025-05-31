export default async function NotFound() {
  return (
    <div className="h-screen flex justify-center items-center">
      <div className="text-xl flex flex-col justify-center items-center w-full text-red-800 gap-y-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-20"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
          />
        </svg>
        <h1>صفحه مورد نظر یافت نشد!</h1>
      </div>
    </div>
  );
}
