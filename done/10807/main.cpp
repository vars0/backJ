#include <iostream>
int main(int argc, char **argv)
{
  int N = 0;
  std::cin >> N;
  int D[N];
  for (int i = 0; i < N; i++)
  {
    std::cin >> D[i];
  }
  int v = 0;
  std::cin >> v;
  int Vnum = 0;
  for (int i = 0; i < N; i++)
  {
    if (D[i] == v)
    {
      Vnum++;
    }
  }
  std::cout << Vnum;
  return 0;
}