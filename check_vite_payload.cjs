async function test() {
  const res = await fetch('http://localhost:3000/src/App.tsx');
  const text = await res.text();
  if (text.includes('Error:')) {
    console.log("VITE RETURNED ERROR PAYLOAD:", text.substring(0, 500));
  } else {
    console.log("No error payload detected in /src/App.tsx.");
  }
}
test();
